// OAuth によるログインフローを共通化するためのクラス

import { vValidator } from "@hono/valibot-validator";
import {
	deleteCookie,
	getSignedCookie,
	setCookie,
	setSignedCookie,
} from "hono/cookie";
import * as v from "valibot";
import { COOKIE_NAME } from "../constants/cookie";
import {
	ONLY_GITHUB_LOGIN_IS_AVAILABLE_FOR_INVITATION,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../constants/toast";
import { factory } from "../factory";
import { binaryToBase64 } from "./oauth/convert-bin-base64";

interface OAuthLoginProviderOptions {
	// 全般設定
	enableInvitation: boolean;
	// authorization 関連
	scopes: string[];
	authorizationUrl: string;
	authorizationOptions?: Record<string, string | string[]>;
}

/**
 * @example
 * ```typescript
 * const provider = new OAuthLoginProvider(options);
 *
 * const route = app
 *   .get("/", ...provider.getLoginHandler())
 *   .get("/callback", ...provider.getCallbackHandler());
 * ```
 */
export abstract class OAuthLoginProvider {
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

	private options: OAuthLoginProviderOptions;

	constructor(options: OAuthLoginProviderOptions) {
		this.options = options;
	}

	abstract getClientId(env: Env): string;
	abstract getClientSecret(env: Env): string;
	abstract getCallbackUrl(origin: string): string;
	abstract makeAccessTokenRequest(
		code: string,
		origin: string,
		env: Env,
	): Promise<void>;
	abstract getAccessToken(
		code: string,
		origin: string,
		env: Env,
	): Promise<string>;

	public getLoginHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.LOGIN_REQUEST_QUERY_SCHEMA),
			async (c) => {
				const { continue_to, invitation_id } = c.req.valid("query");

				if (invitation_id) {
					if (!this.options.enableInvitation) {
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

				const requestUrl = new URL(c.req.url);
				const authorizationUrl = new URL(this.options.authorizationUrl);
				authorizationUrl.searchParams.set("response_type", "code");
				authorizationUrl.searchParams.set("client_id", this.getClientId(c.env));
				authorizationUrl.searchParams.set(
					"redirect_uri",
					this.getCallbackUrl(requestUrl.origin),
				);
				authorizationUrl.searchParams.set(
					"scope",
					this.options.scopes.join(" "),
				);
				authorizationUrl.searchParams.set("state", state);

				// 追加のパラメータがあれば設定
				if (this.options.authorizationOptions) {
					for (const [key, value] of Object.entries(
						this.options.authorizationOptions,
					)) {
						if (Array.isArray(value)) {
							for (const v of value)
								authorizationUrl.searchParams.append(key, v);
						} else {
							authorizationUrl.searchParams.set(key, value);
						}
					}
				}

				return c.redirect(authorizationUrl.toString(), 302);
			},
		);
	}

	public getCallbackHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.CALLBACK_REQUEST_QUERY_SCHEMA),
			async (c) => {
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
				let accessToken = "";
				try {
					accessToken = await this.getAccessToken(
						code,
						requestUrl.origin,
						c.env,
					);
				} catch {
					return c.text("invalid code", 400);
				}
			},
		);
	}
}
