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
import {
	deleteCookie,
	getCookie,
	getSignedCookie,
	setCookie,
	setSignedCookie,
} from "hono/cookie";
import { sign, verify } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";
import * as v from "valibot";
import { COOKIE_NAME } from "../../constants/cookie";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import {
	ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION,
	PLEASE_CONNECT_OAUTH_ACCOUNT,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../../constants/toast";
import { type HonoEnv, factory } from "../../factory";
import type { OAuthConnection } from "../../repository/oauth-internal";
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";

const app = factory.createApp();

const JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week

interface FetchAccessTokenParams {
	code: string;
	redirectUri: string;
	clientId: string;
	clientSecret: string;
}

const fetchAccessToken = async ({
	code,
	redirectUri,
	clientId,
	clientSecret,
}: FetchAccessTokenParams): Promise<RESTPostOAuth2AccessTokenResult | null> => {
	const body = new URLSearchParams();
	body.set("grant_type", "authorization_code");
	body.set("code", code);
	body.set("redirect_uri", redirectUri);
	body.set("client_id", clientId);
	body.set("client_secret", clientSecret);

	try {
		const res = await fetch(OAuth2Routes.tokenURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			body,
		});
		return await res.json<RESTPostOAuth2AccessTokenResult>();
	} catch {
		return null;
	}
};

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

		const requestUrl = new URL(c.req.url);

		// invitation_id がセットされている場合は GitHub でしかログインできないようにする
		if (invitation_id) {
			// invitation_id はそのままにしておく
			const redirectUrl = new URL(
				`/invitation/${invitation_id}`,
				c.env.CLIENT_ORIGIN,
			);
			// GitHub でしかログインできないことを Toast で表示
			redirectUrl.searchParams.set(
				TOAST_SEARCHPARAM,
				ToastHashFn(ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION),
			);
			return c.redirect(redirectUrl.toString(), 302);
		}

		setCookie(c, COOKIE_NAME.CONTINUE_TO, continue_to ?? "/");

		const state = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)));
		await setSignedCookie(
			c,
			COOKIE_NAME.OAUTH_SESSION_STATE,
			state,
			c.env.SECRET,
			getCookieOptions(requestUrl.protocol === "http:"),
		);

		// ref: https://discord.com/developers/docs/topics/oauth2
		const oauthUrl = new URL(OAuth2Routes.authorizationURL);
		const oauthParams = new URLSearchParams();
		oauthParams.set("client_id", c.env.DISCORD_OAUTH_ID);
		oauthParams.set(
			"redirect_uri",
			`${requestUrl.origin}/auth/login/discord/callback`,
		);
		oauthParams.set(
			"scope",
			[OAuth2Scopes.Identify, OAuth2Scopes.GuildsJoin].join(" "),
		);
		oauthParams.set("state", state);
		oauthParams.set("response_type", "code");
		// 個人認証のため USER_INSTALL にする (SERVER_INSTALL はしない)
		oauthParams.set("integration_type", "1");
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

			const discordAccessTokenRes = await fetchAccessToken({
				code,
				redirectUri: `${new URL(c.req.url).origin}/auth/login/discord/callback`,
				clientId: c.env.DISCORD_OAUTH_ID,
				clientSecret: c.env.DISCORD_OAUTH_SECRET,
			});

			if (!discordAccessTokenRes) {
				return c.text("invalid code", 400);
			}

			const { access_token, refresh_token } = discordAccessTokenRes;

			let discordUser: APIUser;
			try {
				discordUser =
					await c.var.DiscordBotRepository.fetchUserByAccessToken(access_token);
			} catch {
				return c.text("invalid user", 400);
			}

			// 先に Redirect URL の validate (共通なので)
			const requestUrl = new URL(c.req.url);
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

			// ログイン状態をチェック
			let loggedInUserId: string | null = null;
			const cookieJwt = await getSignedCookie(
				c,
				c.env.SECRET,
				COOKIE_NAME.LOGIN_STATE,
			);
			if (cookieJwt) {
				const payload = await verify(cookieJwt, c.env.SECRET);
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
