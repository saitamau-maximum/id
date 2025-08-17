// OAuth によるログインフローを共通化するためのクラス

import { vValidator } from "@hono/valibot-validator";
import {
	deleteCookie,
	getCookie,
	getSignedCookie,
	setCookie,
	setSignedCookie,
} from "hono/cookie";
import { sign, verify } from "hono/jwt";
import * as v from "valibot";
import { COOKIE_NAME } from "../constants/cookie";
import {
	ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION,
	PLEASE_CONNECT_OAUTH_ACCOUNT,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../constants/toast";
import { type HonoEnv, factory } from "../factory";
import type { OAuthConnection } from "../repository/oauth-internal";
import { validateInvitation } from "../service/invite";
import { binaryToBase64 } from "./oauth/convert-bin-base64";
import { type Awaitable, NullToUndefined } from "./types";

/**
 * @example
 * ```typescript
 * class Provider extends OAuthLoginProvider {
 *   // implement abstract methods
 *   getClientId(): string { ... }
 *   ...
 * }
 *
 * const provider = new Provider();
 *
 * const route = app
 *   .get("/", ...provider.getLoginHandler())
 *   .get("/callback", ...provider.getCallbackHandler());
 * ```
 */
export abstract class OAuthLoginProvider {
	// ----- static readonly ----- //
	static readonly JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week

	static readonly COOKIE_OPTIONS = {
		path: "/",
		secure: true, // localhost は特別扱いされるので、常に true にしても問題ない
		sameSite: "lax", // "strict" にすると callback で読み取れなくなる
		httpOnly: true,
		maxAge: OAuthLoginProvider.JWT_EXPIRATION,
	} as const;

	static readonly CALLBACK_REQUEST_QUERY_SCHEMA = v.object({
		code: v.pipe(v.string(), v.nonEmpty()),
		state: v.pipe(v.string(), v.nonEmpty()),
	});

	static readonly LOGIN_REQUEST_QUERY_SCHEMA = v.object({
		continue_to: v.string(),
		invitation_id: v.optional(v.string()),
	});

	// ----- protected members ----- //
	protected env: Env | undefined;
	protected origin: string | undefined;
	protected honoVariables: HonoEnv["Variables"] | undefined;

	// ----- abstract methods ----- //
	/**
	 * 招待コードが付与された状態でのログインを許可するか
	 */
	abstract acceptsInvitation(): boolean;
	/**
	 * Authorization URL (response_type, client_id, redirect_uri, state 以外)
	 */
	abstract getAuthorizationUrl(): URL;
	abstract getClientId(): string;
	abstract getClientSecret(): string;
	abstract getCallbackUrl(): string;
	abstract getAccessToken(code: string): Awaitable<string>;
	abstract getAccessTokenExpiresAt(): Awaitable<Date | null>;
	abstract getRefreshToken(): Awaitable<string>;
	abstract getRefreshTokenExpiresAt(): Awaitable<Date | null>;
	abstract getProviderId(): number;
	abstract getProviderUserId(): Awaitable<string>;
	abstract getOAuthConnectionUserPayload(): Awaitable<
		Pick<OAuthConnection, "name" | "profileImageUrl" | "email">
	>;

	// ----- public methods ----- //
	public getLoginHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.LOGIN_REQUEST_QUERY_SCHEMA),
			async (c) => {
				this.env = c.env;
				this.honoVariables = c.var;
				this.origin = new URL(c.req.url).origin;

				const { continue_to, invitation_id } = c.req.valid("query");

				if (invitation_id) {
					if (!this.acceptsInvitation()) {
						// もし招待コードがある場合にログインを許可しない場合、差戻す

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
					// 許可する場合、 Cookie に保存
					setSignedCookie(
						c,
						COOKIE_NAME.INVITATION_ID,
						invitation_id,
						c.env.SECRET,
						OAuthLoginProvider.COOKIE_OPTIONS,
					);
				}

				// continue_to を Cookie に保存
				setCookie(c, COOKIE_NAME.CONTINUE_TO, continue_to ?? "/");

				// state を設定
				const state = binaryToBase64(
					crypto.getRandomValues(new Uint8Array(30)),
				);
				await setSignedCookie(
					c,
					COOKIE_NAME.OAUTH_SESSION_STATE,
					state,
					c.env.SECRET,
					OAuthLoginProvider.COOKIE_OPTIONS,
				);

				const authorizationUrl = this.getAuthorizationUrl();
				authorizationUrl.searchParams.set("response_type", "code");
				authorizationUrl.searchParams.set("client_id", this.getClientId());
				authorizationUrl.searchParams.set(
					"redirect_uri",
					this.getCallbackUrl(),
				);
				authorizationUrl.searchParams.set("state", state);

				return c.redirect(authorizationUrl.toString(), 302);
			},
		);
	}

	public getCallbackHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.CALLBACK_REQUEST_QUERY_SCHEMA),
			async (c) => {
				this.env = c.env;
				this.honoVariables = c.var;
				this.origin = new URL(c.req.url).origin;

				const { code, state } = c.req.valid("query");
				const requestUrl = new URL(c.req.url);

				// state check
				const storedState = await getSignedCookie(
					c,
					c.env.SECRET,
					COOKIE_NAME.OAUTH_SESSION_STATE,
				);
				deleteCookie(c, COOKIE_NAME.OAUTH_SESSION_STATE);
				if (state !== storedState) {
					return c.text("state mismatch", 400);
				}

				// access token を取得
				try {
					await this.getAccessToken(code);
				} catch {
					return c.text("invalid code", 400);
				}

				// ContinueTo の validate
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

				// ログイン状態チェック
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
					let providerUserId: string | null = null;
					try {
						providerUserId = await this.getProviderUserId();
					} catch {
						return c.text("invalid user", 400);
					}

					const doesExistConn =
						await c.var.OAuthInternalRepository.fetchUserIdByProviderInfo(
							await this.getProviderUserId(),
							this.getProviderId(),
						)
							.then(() => true)
							.catch(() => false);

					const payload: OAuthConnection = {
						userId: loggedInUserId,
						providerId: this.getProviderId(),
						providerUserId: await this.getProviderUserId(),
						refreshToken: await this.getRefreshToken(),
						refreshTokenExpiresAt: await this.getRefreshTokenExpiresAt(),
						...(await this.getOAuthConnectionUserPayload()),
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

				// もし未ログイン状態の場合、ユーザーが存在するかチェック
				let foundUserId: string | null = null;
				try {
					foundUserId =
						await c.var.OAuthInternalRepository.fetchUserIdByProviderInfo(
							await this.getProviderUserId(),
							this.getProviderId(),
						);
				} catch {
					// ユーザーが存在しない場合

					// 招待経由かチェックする
					if (this.acceptsInvitation()) {
						const invitationId = await getSignedCookie(
							c,
							c.env.SECRET,
							COOKIE_NAME.INVITATION_ID,
						);
						deleteCookie(c, COOKIE_NAME.INVITATION_ID);

						if (typeof invitationId === "string") {
							// 招待コードの署名検証に成功しているので、コードを検証
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
								NullToUndefined(await this.getOAuthConnectionUserPayload()),
							);
							await c.var.OAuthInternalRepository.createOAuthConnection({
								userId: foundUserId,
								providerId: this.getProviderId(),
								providerUserId: await this.getProviderUserId(),
								refreshToken: await this.getRefreshToken(),
								refreshTokenExpiresAt: await this.getRefreshTokenExpiresAt(),
								...(await this.getOAuthConnectionUserPayload()),
							});
						} else {
							// ここに到達する = 招待コードが提供されていないのにユーザーが存在しない場合
							return c.text("invalid invitation code", 400);
						}
					}

					// 招待コードでログインできない場合 = OAuth 未連携
					// ログインページに差し戻し
					const redirectUrl = new URL("/login", c.env.CLIENT_ORIGIN);
					// continue_to はそのままにしておく
					redirectUrl.searchParams.set("continue_to", continueTo);
					redirectUrl.searchParams.set(
						TOAST_SEARCHPARAM,
						ToastHashFn(PLEASE_CONNECT_OAUTH_ACCOUNT),
					);
					return c.redirect(redirectUrl.toString(), 302);
				}

				// ユーザーが存在する場合
				const payload: OAuthConnection = {
					userId: foundUserId,
					providerId: this.getProviderId(),
					providerUserId: await this.getProviderUserId(),
					refreshToken: await this.getRefreshToken(),
					refreshTokenExpiresAt: await this.getRefreshTokenExpiresAt(),
					...(await this.getOAuthConnectionUserPayload()),
				};
				// OAuth Connection 情報を更新
				await c.var.OAuthInternalRepository.updateOAuthConnection(payload);

				// 最終ログイン日時を更新
				await c.var.UserRepository.updateLastLoginAt(foundUserId);

				// JWT 構築 & セット
				const now = Math.floor(Date.now() / 1000);
				const jwt = await sign(
					{
						userId: foundUserId,
						iat: now,
						exp: now + OAuthLoginProvider.JWT_EXPIRATION,
					},
					c.env.SECRET,
				);

				await setSignedCookie(
					c,
					COOKIE_NAME.LOGIN_STATE,
					jwt,
					c.env.SECRET,
					OAuthLoginProvider.COOKIE_OPTIONS,
				);

				const ott = crypto.getRandomValues(new Uint8Array(32)).join("");
				await c.var.SessionRepository.storeOneTimeToken(
					ott,
					jwt,
					OAuthLoginProvider.JWT_EXPIRATION,
				);
				continueToUrl.searchParams.set("ott", ott);

				return c.redirect(continueToUrl.toString(), 302);
			},
		);
	}
}
