import { vValidator } from "@hono/valibot-validator";
import {
	OAuth2Routes,
	OAuth2Scopes,
	type RESTGetAPICurrentUserResult,
	type RESTPostOAuth2AccessTokenResult,
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
}: FetchAccessTokenParams): Promise<
	RESTPostOAuth2AccessTokenResult | { access_token: null }
> => {
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
		return {
			access_token: null,
		};
	}
};

// ここでしか使わないので特にリポジトリ抽象化しない
const fetchUser = async (accessToken: string) => {
	const endpoint = "https://discord.com/api/v10/users/@me";
	try {
		const res = await fetch(endpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return await res.json<RESTGetAPICurrentUserResult>();
	} catch {
		return {
			id: null,
		};
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

		// invitation_id がセットされている場合は GitHub でしかログインできないようにする
		if (invitation_id) {
			// TODO
			return c.text("Discord login is not available", 400);
		}

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

		// ref: https://discord.com/developers/docs/topics/oauth2
		const oauthUrl = new URL(OAuth2Routes.authorizationURL);
		const oauthParams = new URLSearchParams();
		oauthParams.set("client_id", c.env.DISCORD_OAUTH_ID);
		oauthParams.set(
			"redirect_uri",
			`${requestUrl.origin}/auth/login/discord/callback`,
		);
		oauthParams.set("scope", [OAuth2Scopes.Identify].join(" "));
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

			const { access_token } = await fetchAccessToken({
				code,
				redirectUri: `${new URL(c.req.url).origin}/auth/login/discord/callback`,
				clientId: c.env.DISCORD_OAUTH_ID,
				clientSecret: c.env.DISCORD_OAUTH_SECRET,
			});

			if (!access_token) {
				return c.text("invalid code", 400);
			}

			const discordUser = await fetchUser(access_token);

			if (!discordUser.id) {
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
					name: discordUser.username,
					// avatar は image hash が入る
					// ref: https://discord.com/developers/docs/resources/user#usernames-and-nicknames, https://discord.com/developers/docs/reference#image-formatting
					profileImageUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp`,
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
				// TODO: 「まず紐づけてください」とともにログインページにリダイレクト
				return c.text("User not found", 400);
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
