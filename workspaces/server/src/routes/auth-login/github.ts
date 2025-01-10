import { vValidator } from "@hono/valibot-validator";
import { createAppAuth } from "@octokit/auth-app";
import {
	deleteCookie,
	getCookie,
	getSignedCookie,
	setSignedCookie,
} from "hono/cookie";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";
import { Octokit } from "octokit";
import * as v from "valibot";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { factory } from "../../factory";
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";

const app = factory.createApp();

const JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week
const STATE_COOKIE_NAME = "oauth_state";

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

const route = app
	.get("/", async (c) => {
		const requestUrl = new URL(c.req.url);

		const state = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)));
		await setSignedCookie(
			c,
			STATE_COOKIE_NAME,
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
				STATE_COOKIE_NAME,
			);
			deleteCookie(c, STATE_COOKIE_NAME);

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

			// ----- メンバーの所属判定 ----- //
			// TODO: #6 が merge されたら GithubRepository ができるのでそこから取得するようにする
			const userOctokit = new Octokit({ auth: access_token });
			const appOctokit = new Octokit({
				authStrategy: createAppAuth,
				auth: {
					appId: c.env.GITHUB_APP_ID,
					privateKey: atob(c.env.GITHUB_APP_PRIVKEY),
					installationId: c.env.GITHUB_APP_INSTALLID,
				},
			});

			const { data: user } = await userOctokit.request("GET /user");
			let isMember = false;
			try {
				const checkIsOrgMemberRes = await appOctokit.request(
					"GET /orgs/{org}/members/{username}",
					{
						org: "saitamau-maximum",
						username: user.login,
					},
				);
				isMember = (checkIsOrgMemberRes.status as number) === 204;
			} catch {
				isMember = false;
			}

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
				"token",
				jwt,
				c.env.SECRET,
				getCookieOptions(requestUrl.protocol === "http:"),
			);

			// const ott = crypto.getRandomValues(new Uint8Array(32)).join("");

			// await c.var.SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);

			// return c.redirect(`${c.env.CLIENT_REDIRECT_URL}?ott=${ott}`);

			const continueTo = getCookie(c, "continue_to") ?? "/";
			deleteCookie(c, "continue_to");
			return c.redirect(continueTo);
		},
	);

export { route as authLoginGithubRoute };
