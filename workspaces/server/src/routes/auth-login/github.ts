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

			const isMember = await c.var.OrganizationRepository.checkIsMember(
				user.login,
			);

			if (!isMember) {
				// いったん Maximum Member じゃない場合はログインさせないようにする
				return c.text("not a member", 403);
			}

			let foundUserId = null;
			try {
				// ユーザーが存在するか確認
				const res = await c.var.UserRepository.fetchUserByProviderInfo(
					String(user.id),
					OAUTH_PROVIDER_IDS.GITHUB,
				);
				foundUserId = res.id;
			} catch (e) {
				// もしユーザーが見つからなかったら新規作成
				foundUserId = await c.var.UserRepository.createUser(
					String(user.id),
					OAUTH_PROVIDER_IDS.GITHUB,
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

			const ott = crypto.getRandomValues(new Uint8Array(32)).join("");

			await c.var.SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);

			const query = new URLSearchParams();
			query.set("ott", ott);

			return c.redirect(
				`${c.env.CLIENT_REDIRECT_URL}?${query.toString()}`,
				302,
			);
		},
	);

export { route as authLoginGithubRoute };
