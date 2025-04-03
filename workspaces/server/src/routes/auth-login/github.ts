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
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";

const app = factory.createApp();

const JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week

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
	continue_to: v.optional(v.string()),
});

const route = app
	.get("/", vValidator("query", loginRequestQuerySchema), async (c) => {
		const { continue_to } = c.req.valid("query");

		setCookie(c, COOKIE_NAME.CONTINUE_TO, continue_to ?? "/");

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

			const consumeInvitation = async (
				invitationId: string,
			): Promise<boolean> => {
				try {
					const invitation =
						await c.var.InviteRepository.getInviteById(invitationId);
					if (!invitation) return false;
					// 利用可能回数の検証
					if (invitation.remainingUse !== null && invitation.remainingUse <= 0)
						return false;
					// 有効期限の検証
					if (
						invitation.expiresAt !== null &&
						invitation.expiresAt < new Date()
					)
						return false;
					await c.var.InviteRepository.reduceInviteUsage(invitationId);
					return true;
				} catch {
					return false;
				}
			};

			if (typeof invitationId === "string") {
				// 招待コードの署名検証に成功しているので、コードを検証する
				const valid = await consumeInvitation(invitationId);
				if (!valid) {
					return c.text("invalid invitation code", 400);
				}
			} else if (invitationId === undefined) {
				// 招待コードが存在しない場合、Organization のメンバーかどうかを確認する
				const isMember = await c.var.OrganizationRepository.checkIsMember(
					user.login,
				);
				if (!isMember) {
					return c.text("invitation code required for non-members", 403);
				}
			} else {
				// invitationId が false など、署名検証に失敗している場合
				return c.text("invalid invitation code", 400);
			}

			let foundUserId = null;
			try {
				// ユーザーが存在するか確認
				const id = await c.var.UserRepository.fetchUserIdByProviderInfo(
					String(user.id),
					OAUTH_PROVIDER_IDS.GITHUB,
				);
				foundUserId = id;
			} catch (e) {
				// もしユーザーが見つからなかったら新規作成
				foundUserId = await c.var.UserRepository.createUser(
					String(user.id),
					OAUTH_PROVIDER_IDS.GITHUB,
					invitationId,
					{
						email: user.email ?? undefined,
						displayName: user.login,
						profileImageURL: user.avatar_url,
					},
				);
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
