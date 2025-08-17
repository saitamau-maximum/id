import { vValidator } from "@hono/valibot-validator";
import {
	type APIUser,
	CDNRoutes,
	type DefaultUserAvatarAssets,
	ImageFormat,
	OAuth2Routes,
	OAuth2Scopes,
	type RESTPostOAuth2AccessTokenResult,
	RouteBases,
} from "discord-api-types/v10";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { COOKIE_NAME } from "../../constants/cookie";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import {
	PLEASE_CONNECT_OAUTH_ACCOUNT,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../../constants/toast";
import { type HonoEnv, factory } from "../../factory";
import type { OAuthConnection } from "../../repository/oauth-internal";
import { OAuthLoginProvider } from "../../utils/oauth-login-provider";

const app = factory.createApp();

class DiscordLoginProvider extends OAuthLoginProvider {
	private accessTokenResponse: RESTPostOAuth2AccessTokenResult | null = null;

	getClientId(env: Env): string {
		return env.DISCORD_OAUTH_ID;
	}

	getClientSecret(env: Env): string {
		return env.DISCORD_OAUTH_SECRET;
	}

	getCallbackUrl(origin: string): string {
		return `${origin}/auth/login/discord/callback`;
	}

	async makeAccessTokenRequest(
		code: string,
		origin: string,
		env: Env,
	): Promise<void> {
		const body = new URLSearchParams();
		body.set("grant_type", "authorization_code");
		body.set("code", code);
		body.set("redirect_uri", this.getCallbackUrl(origin));
		body.set("client_id", this.getClientId(env));
		body.set("client_secret", this.getClientSecret(env));

		return fetch(OAuth2Routes.tokenURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			body,
		}).then(async (res) => {
			this.accessTokenResponse =
				await res.json<RESTPostOAuth2AccessTokenResult>();
		});
	}

	async getAccessToken(
		code: string,
		origin: string,
		env: Env,
	): Promise<string> {
		await this.makeAccessTokenRequest(code, origin, env);
		const accessToken = this.accessTokenResponse?.access_token;
		if (!accessToken) throw new Error("Failed to fetch access token");
		return accessToken;
	}
}

const discordLogin = new DiscordLoginProvider({
	enableInvitation: false,

	// ref: https://discord.com/developers/docs/topics/oauth2
	scopes: [OAuth2Scopes.Identify, OAuth2Scopes.GuildsJoin],
	authorizationUrl: OAuth2Routes.authorizationURL,
	authorizationOptions: {
		integration_type: "1", // 個人認証のため USER_INSTALL にする
	},
});

const route = app
	.get("/", ...discordLogin.getLoginHandlers())
	.get(
		"/callback",
		vValidator("query", callbackRequestQuerySchema),
		async (c) => {
			const { code, state } = c.req.valid("query");

			const { access_token, refresh_token } = discordAccessTokenRes;

			let discordUser: APIUser;
			try {
				discordUser =
					await c.var.DiscordBotRepository.fetchUserByAccessToken(access_token);
			} catch {
				return c.text("invalid user", 400);
			}

			// ログイン状態をチェック
			let loggedInUserId: string | null = null;
			const cookieJwt = await getSignedCookie(
				c,
				c.env.SECRET,
				COOKIE_NAME.LOGIN_STATE,
			);
			if (cookieJwt) {
				const payload = await verify(cookieJwt, c.env.SECRET).catch(
					() => undefined,
				);
				if (payload) {
					loggedInUserId = (payload as HonoEnv["Variables"]["jwtPayload"])
						.userId;
				}
			}

			// もしログインしている場合には、 Settings からの OAuth Conn 作成/更新リクエストとみなす
			if (loggedInUserId) {
				const doesExistConn =
					await c.var.OAuthInternalRepository.fetchUserIdByProviderInfo(
						discordUser.id,
						OAUTH_PROVIDER_IDS.DISCORD,
					)
						.then(() => true)
						.catch(() => false);

				const payload: OAuthConnection = {
					userId: loggedInUserId,
					providerId: OAUTH_PROVIDER_IDS.DISCORD,
					providerUserId: discordUser.id,
					refreshToken: refresh_token ?? null,
					refreshTokenExpiresAt: null, // Discord では Refresh Token の有効期限はないっぽい？
					name: discordUser.username,
					// avatar は image hash が入る
					// ref: https://discord.com/developers/docs/resources/user#usernames-and-nicknames, https://discord.com/developers/docs/reference#image-formatting
					profileImageUrl: discordUser.avatar
						? RouteBases.cdn +
							CDNRoutes.userAvatar(
								discordUser.id,
								discordUser.avatar,
								ImageFormat.WebP,
							)
						: RouteBases.cdn +
							CDNRoutes.defaultUserAvatar(
								// new username system なら (id >> 22) % 6 で、 legacy username system なら discriminator % 5 らしい
								// discriminator が "0" の場合は new username system とのこと
								// ref: https://discord.com/developers/docs/change-log#identifying-migrated-users
								discordUser.discriminator === "0"
									? (((((Number.parseInt(discordUser.id, 10) >> 22) % 6) + 6) %
											6) as DefaultUserAvatarAssets)
									: ((Number.parseInt(discordUser.discriminator, 10) %
											5) as DefaultUserAvatarAssets),
							),
					// 取得したい場合には email scope をつける
					email: discordUser.email ?? null,
				};

				if (doesExistConn) {
					// すでに存在する場合は更新
					await c.var.OAuthInternalRepository.updateOAuthConnection(payload);
				} else {
					// 存在しない場合は新規作成
					await c.var.OAuthInternalRepository.createOAuthConnection(payload);
				}

				return c.redirect(continueToUrl.toString(), 302);
			}

			// 未ログインの場合
			let foundUserId: string | null = null;
			try {
				// ユーザーの存在確認
				foundUserId =
					await c.var.OAuthInternalRepository.fetchUserIdByProviderInfo(
						discordUser.id,
						OAUTH_PROVIDER_IDS.DISCORD,
					);
			} catch {
				// 未ログイン時かつ未連携ならログインページに差し戻し
				const redirectUrl = new URL("/login", c.env.CLIENT_ORIGIN);
				// continue_to はそのままにしておく
				redirectUrl.searchParams.set("continue_to", continueTo);
				redirectUrl.searchParams.set(
					TOAST_SEARCHPARAM,
					ToastHashFn(PLEASE_CONNECT_OAUTH_ACCOUNT),
				);
				return c.redirect(redirectUrl.toString(), 302);
			}

			// JWT 構築 & セット
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

			const ott = crypto.getRandomValues(new Uint8Array(32)).join("");
			await c.var.SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);
			continueToUrl.searchParams.set("ott", ott);

			// ユーザーの存在確認後、最終ログイン日時を更新
			await c.var.UserRepository.updateLastLoginAt(foundUserId);

			return c.redirect(continueToUrl.toString(), 302);
		},
	);

export { route as authLoginDiscordRoute };
