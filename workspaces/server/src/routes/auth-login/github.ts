import { vValidator } from "@hono/valibot-validator";
import {
	deleteCookie,
	getCookie,
	getSignedCookie,
	setCookie,
	setSignedCookie,
} from "hono/cookie";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";
import { Octokit } from "octokit";
import * as v from "valibot";
import { COOKIE_NAME } from "../../constants/cookie";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { factory } from "../../factory";
import { validateInvitation } from "../../service/invite";
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";

const app = factory.createApp();

const JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week
const INVITATION_ERROR_MESSAGE = "invalid invitation code";

interface GitHubOAuthTokenResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

const fetchAccessToken = (
	code: string,
	clientId: string,
	clientSecret: string,
) =>
	fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
		}),
	})
		.then((res) => res.json<GitHubOAuthTokenResponse>())
		.catch(() => ({ access_token: null }));

const getCookieOptions = (isLocal: boolean): CookieOptions => ({
	path: "/",
	secure: !isLocal,
	sameSite: "lax", // "strict" にすると callback で読み取れなくなる
	httpOnly: true,
	maxAge: JWT_EXPIRATION,
});

const callbackRequestQuerySchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
	state: v.pipe(v.string(), v.nonEmpty()),
});

const loginRequestQuerySchema = v.object({
	continue_to: v.string(),
	invitation_id: v.optional(v.string()),
});

const route = app
	.get("/", vValidator("query", loginRequestQuerySchema), async (c) => {
		const { continue_to, invitation_id } = c.req.valid("query");

		setCookie(c, COOKIE_NAME.CONTINUE_TO, continue_to ?? "/");
		if (invitation_id) {
			setSignedCookie(
				c,
				COOKIE_NAME.INVITATION_ID,
				invitation_id,
				c.env.SECRET,
				getCookieOptions(new URL(c.req.url).protocol === "http:"),
			);
		}

		const requestUrl = new URL(c.req.url);

		const state = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)));
		await setSignedCookie(
			c,
			COOKIE_NAME.OAUTH_SESSION_STATE,
			state,
			c.env.SECRET,
			getCookieOptions(requestUrl.protocol === "http:"),
		);

		// ref: https://docs.github.com/ja/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
		const oauthUrl = new URL("https://github.com/login/oauth/authorize");
		const oauthParams = new URLSearchParams();
		oauthParams.set("client_id", c.env.GITHUB_OAUTH_ID);
		oauthParams.set(
			"redirect_uri",
			`${requestUrl.origin}/auth/login/github/callback`,
		);
		oauthParams.set("scope", "read:user");
		oauthParams.set("state", state);
		oauthParams.set("allow_signup", "false");
		return c.redirect(`${oauthUrl.toString()}?${oauthParams.toString()}`, 302);
	})
	.get(
		"/callback",
		vValidator("query", callbackRequestQuerySchema),
		async (c) => {
			const { code, state } = c.req.valid("query");

			const storedState = await getSignedCookie(
				c,
				c.env.SECRET,
				COOKIE_NAME.OAUTH_SESSION_STATE,
			);
			deleteCookie(c, COOKIE_NAME.OAUTH_SESSION_STATE);

			if (state !== storedState) {
				return c.text("state mismatch", 400);
			}

			const { access_token } = await fetchAccessToken(
				code,
				c.env.GITHUB_OAUTH_ID,
				c.env.GITHUB_OAUTH_SECRET,
			);

			if (!access_token) {
				return c.text("invalid code", 400);
			}

			// ここでしか使わないので user 側は特にリポジトリ抽象化しない
			const userOctokit = new Octokit({ auth: access_token });
			const { data: user } = await userOctokit.request("GET /user");

			const invitationId = await getSignedCookie(
				c,
				c.env.SECRET,
				COOKIE_NAME.INVITATION_ID,
			);
			deleteCookie(c, COOKIE_NAME.INVITATION_ID);

			const githubUserIdStr = String(user.id);
			let foundUserId: string | null;
			try {
				// ユーザーの存在確認
				foundUserId = await c.var.UserRepository.fetchUserIdByProviderInfo(
					githubUserIdStr,
					OAUTH_PROVIDER_IDS.GITHUB,
				);
			} catch {
				// ユーザーが存在しなかった場合
				if (typeof invitationId === "string") {
					// 招待コードの署名検証に成功しているので、コードを検証する
					try {
						// 招待コードが有効かチェックし、有効な場合は消費する
						await validateInvitation(c.var.InviteRepository, invitationId);
						await c.var.InviteRepository.reduceInviteUsage(invitationId);
					} catch (e) {
						return c.text((e as Error).message, 400);
					}
					// 招待コードが有効な場合、仮登録処理を行う
					foundUserId = await c.var.UserRepository.createTemporaryUser(
						githubUserIdStr,
						OAUTH_PROVIDER_IDS.GITHUB,
						invitationId,
						{
							email: user.email ?? undefined,
							displayName: user.login,
							profileImageURL: user.avatar_url,
						},
					);
				} else if (invitationId === undefined) {
					// 招待コードが提供されなかった場合、GitHub Organization メンバーかどうかを確認する処理
					const isMember = await c.var.OrganizationRepository.checkIsMember(
						user.login,
					);
					if (!isMember)
						return c.text("invitation code required for non-members", 403);
					// Organization のメンバーであれば、本登録処理を行う
					foundUserId = await c.var.UserRepository.createUser(
						githubUserIdStr,
						OAUTH_PROVIDER_IDS.GITHUB,
						{
							email: user.email ?? undefined,
							displayName: user.login,
							profileImageURL: user.avatar_url,
						},
					);
				} else {
					// invitationId が不正な場合の処理
					return c.text(INVITATION_ERROR_MESSAGE, 400);
				}
			}

			const now = Math.floor(Date.now() / 1000);
			const jwt = await sign(
				{
					userId: foundUserId,
					iat: now,
					exp: now + JWT_EXPIRATION,
				},
				c.env.SECRET,
			);

			const requestUrl = new URL(c.req.url);
			await setSignedCookie(
				c,
				COOKIE_NAME.LOGIN_STATE,
				jwt,
				c.env.SECRET,
				getCookieOptions(requestUrl.protocol === "http:"),
			);

			const continueTo = getCookie(c, COOKIE_NAME.CONTINUE_TO);
			deleteCookie(c, COOKIE_NAME.CONTINUE_TO);
			if (continueTo === undefined) {
				return c.text("Bad Request", 400);
			}
			if (!URL.canParse(continueTo)) {
				return c.text("Bad Request", 400);
			}

			const continueToUrl = new URL(continueTo);

			// 本番環境で、本番環境以外のクライアントURLにリダイレクトさせようとした場合はエラー
			if (
				(c.env.ENV as string) === "production" &&
				continueToUrl.origin !== c.env.CLIENT_ORIGIN &&
				continueToUrl.origin !== requestUrl.origin
			) {
				return c.text("Bad Request", 400);
			}

			const ott = crypto.getRandomValues(new Uint8Array(32)).join("");

			await c.var.SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);

			continueToUrl.searchParams.set("ott", ott);

			return c.redirect(continueToUrl.toString(), 302);
		},
	);

export { route as authLoginGithubRoute };
