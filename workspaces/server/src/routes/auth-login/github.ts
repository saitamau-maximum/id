import { vValidator } from "@hono/valibot-validator";
import {
	deleteCookie,
	getCookie,
	getSignedCookie,
	setSignedCookie,
} from "hono/cookie";
import { sign } from "hono/jwt";
import { Octokit } from "octokit";
import { COOKIE_NAME } from "../../constants/cookie";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { factory } from "../../factory";
import { validateInvitation } from "../../service/invite";
import { OAuthLoginProvider } from "../../utils/oauth-login-provider";

const app = factory.createApp();

class GitHubLoginProvider extends OAuthLoginProvider {
	getClientId(env: Env): string {
		return env.GITHUB_OAUTH_ID;
	}
}

const githubLogin = new GitHubLoginProvider({
	enableInvitation: true,
	callbackPath: "/auth/login/github/callback",

	// ref: https://docs.github.com/ja/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
	scopes: ["read:user"],
	authorizationUrl: "https://github.com/login/oauth/authorize",
	authorizationOptions: {
		allow_signup: "false",
	},
});

const INVITATION_ERROR_MESSAGE = "invalid invitation code";

interface GitHubOAuthTokenParams {
	code: string;
	redirectUri: string;
	clientId: string;
	clientSecret: string;
}

interface GitHubOAuthTokenResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

const fetchAccessToken = (params: GitHubOAuthTokenParams) =>
	fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			client_id: params.clientId,
			client_secret: params.clientSecret,
			redirect_uri: params.redirectUri,
			code: params.code,
		}),
	})
		.then((res) => res.json<GitHubOAuthTokenResponse>())
		.catch(() => ({ access_token: null }));

const route = app
	.get("/", ...githubLogin.getLoginHandlers())
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

			const requestUrl = new URL(c.req.url);

			const { access_token } = await fetchAccessToken({
				code,
				clientId: c.env.GITHUB_OAUTH_ID,
				clientSecret: c.env.GITHUB_OAUTH_SECRET,
				redirectUri: `${requestUrl.origin}/auth/login/github/callback`,
			});

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
				foundUserId =
					await c.var.OAuthInternalRepository.fetchUserIdByProviderInfo(
						githubUserIdStr,
						OAUTH_PROVIDER_IDS.GITHUB,
					);
			} catch {
				// ユーザーが存在しなかった場合

				// ユーザーが存在する場合・新規作成の場合にまとめて更新しちゃうので、一時的に null 埋めする
				const temporaryConnectionPayload = {
					refreshToken: null,
					refreshTokenExpiresAt: null,
					name: null,
					email: null,
					profileImageUrl: null,
				};

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
						invitationId,
						{
							displayName: user.login,
							profileImageURL: user.avatar_url,
						},
					);
					await c.var.OAuthInternalRepository.createOAuthConnection({
						userId: foundUserId,
						providerId: OAUTH_PROVIDER_IDS.GITHUB,
						providerUserId: githubUserIdStr,
						...temporaryConnectionPayload,
					});
				} else if (invitationId === undefined) {
					// 招待コードが提供されなかった場合、GitHub Organization メンバーかどうかを確認する処理
					const isMember = await c.var.OrganizationRepository.checkIsMember(
						user.login,
					);
					if (!isMember)
						return c.text("invitation code required for non-members", 403);
					// Organization のメンバーであれば、本登録処理を行う
					foundUserId = await c.var.UserRepository.createUser({
						displayName: user.login,
						profileImageURL: user.avatar_url,
					});
					// 最低限の OAuth Connection 情報を作成
					await c.var.OAuthInternalRepository.createOAuthConnection({
						userId: foundUserId,
						providerId: OAUTH_PROVIDER_IDS.GITHUB,
						providerUserId: githubUserIdStr,
						...temporaryConnectionPayload,
					});
				} else {
					// invitationId が不正な場合の処理
					return c.text(INVITATION_ERROR_MESSAGE, 400);
				}
			}

			// OAuth Connection 情報を更新
			await c.var.OAuthInternalRepository.updateOAuthConnection({
				userId: foundUserId,
				providerId: OAUTH_PROVIDER_IDS.GITHUB,
				providerUserId: githubUserIdStr,
				// GitHub では OAuth Access Token は Revoke しない限り無期限に使える？っぽいので Refresh Token として保管する
				refreshToken: access_token,
				refreshTokenExpiresAt: null,
				name: user.login,
				email: user.email ?? null,
				profileImageUrl: user.avatar_url,
			});

			// ユーザーの存在確認後、最終ログイン日時を更新
			await c.var.UserRepository.updateLastLoginAt(foundUserId);

			const now = Math.floor(Date.now() / 1000);
			const jwt = await sign(
				{
					userId: foundUserId,
					iat: now,
					exp: now + JWT_EXPIRATION,
				},
				c.env.SECRET,
			);

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
