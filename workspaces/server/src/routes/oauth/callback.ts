import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { OAUTH_SCOPE_REGEX } from "../../constants/oauth";
import { factory } from "../../factory";
import { cookieAuthMiddleware } from "../../middleware/auth";
import { validateAuthToken } from "../../utils/oauth/auth-token";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../utils/oauth/constant";
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";
import { derivePublicKey, importKey, jwkToKey } from "../../utils/oauth/key";
import { generateIdToken } from "../../utils/oauth/oidc-logic";

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

const OAUTH_ERROR_URI =
	"https://github.com/saitamau-maximum/id/wiki/oauth-errors#authorization-endpoint";

const app = factory.createApp();

const callbackSchema = v.object({
	// hidden fields
	client_id: v.pipe(v.string(), v.nonEmpty()),
	response_type: v.picklist([
		"code",
		"id_token token",
		"token id_token",
		"id_token",
	] as const),
	response_mode: v.optional(v.picklist(["query", "fragment"] as const)),
	redirect_uri: v.optional(v.pipe(v.string(), v.url())),
	scope: v.optional(v.pipe(v.string(), v.regex(OAUTH_SCOPE_REGEX))),
	state: v.optional(v.string()),
	oidc_nonce: v.optional(v.pipe(v.string(), v.nonEmpty())),
	oidc_auth_time: v.optional(v.pipe(v.string(), v.regex(/^\d+$/))),

	// form で送られるので string になる
	time: v.pipe(v.string(), v.nonEmpty(), v.digits()),
	auth_token: v.pipe(v.string(), v.nonEmpty(), v.base64()),

	authorized: v.union([v.literal("1"), v.literal("0")]),
});

const route = app
	.post(
		"/",
		cookieAuthMiddleware,
		vValidator("form", callbackSchema, (res, c) => {
			// TODO: いい感じのエラー画面を作るかも
			if (!res.success) return c.text("Bad Request: invalid parameters", 400);
		}),
		async (c) => {
			const {
				client_id,
				response_type,
				response_mode,
				redirect_uri,
				scope,
				state,
				oidc_nonce,
				oidc_auth_time: _oidc_auth_time,
				time: _time,
				auth_token,
				authorized,
			} = c.req.valid("form");
			const time = Number.parseInt(_time, 10);
			const oidc_auth_time = _oidc_auth_time
				? Number.parseInt(_oidc_auth_time, 10)
				: undefined;
			const nowUnixMs = Date.now();

			const { userId } = c.get("jwtPayload");

			const { jwk: privKeyJwk } = await importKey(
				c.env.PRIVKEY_FOR_OAUTH,
				"privateKey",
			);
			const pubKeyJwk = derivePublicKey(privKeyJwk);
			const publicKey = await jwkToKey(pubKeyJwk, "publicKey");
			const isValidToken = await validateAuthToken({
				clientId: client_id,
				responseType: response_type,
				responseMode: response_mode,
				redirectUri: redirect_uri,
				scope,
				state,
				oidcNonce: oidc_nonce,
				oidcAuthTime: oidc_auth_time,
				time,
				key: publicKey,
				hash: auth_token,
			});
			// auth_token が妥当 = client_id,redirect_uri,time,scope,state がリクエスト時と一致
			if (!isValidToken) {
				return c.text("Bad Request: invalid auth_token", 400);
			}

			// タイムリミットは 5 min
			if (time + 5 * 60 * 1000 < nowUnixMs) {
				// TODO: 5 min 以内に承認してくださいみたいなメッセージ追加すべき？
				return c.text("Bad Request: authorization request expired", 400);
			}

			const client =
				await c.var.OAuthExternalRepository.getClientById(client_id);

			if (!client) {
				return c.text("Internal Server Error: client not found", 500);
			}

			let redirectTo: URL;
			if (redirect_uri) {
				redirectTo = new URL(redirect_uri);
			} else {
				// `/authorize` 側で client_id に対応する callback_url は必ず存在して 1 つだけであることを保証している
				if (!client || client.callbackUrls.length !== 1) {
					return c.text(
						"Internal Server Error: client callback not found",
						500,
					);
				}
				redirectTo = new URL(client.callbackUrls[0]);
			}

			if (state) redirectTo.searchParams.append("state", state);
			if (authorized === "0") {
				redirectTo.searchParams.append("error", "access_denied");
				redirectTo.searchParams.append(
					"error_description",
					"The user denied the request",
				);
				redirectTo.searchParams.append("error_uri", OAUTH_ERROR_URI);
				return c.redirect(redirectTo.href, 302);
			}

			// scope 取得
			const requestedScopes = new Set(scope ? scope.split(" ") : []);
			const scopes = client.scopes.filter((data) => {
				// scope リクエストしてない場合は requestedScopes = [] なので、全部 true として付与
				if (requestedScopes.size === 0) return true;
				// そうでない場合はリクエストされた scope だけを付与
				return requestedScopes.has(data.name);
			});

			// code (240bit = 8bit * 30) を生成
			const code = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)));

			// access token (312bit = 8bit * 39) を生成
			const accessToken = binaryToBase64(
				crypto.getRandomValues(new Uint8Array(39)),
			);

			// DB に格納して返す
			return await c.var.OAuthExternalRepository.createAccessToken(
				client_id,
				userId,
				code,
				redirect_uri,
				accessToken,
				scopes,
				oidc_nonce,
				oidc_auth_time,
			)
				.then(async () => {
					if (response_type === "code") {
						redirectTo.searchParams.append("code", code);
						return c.redirect(redirectTo.href, 302);
					}

					// OpenID Connect Implicit Flow
					const res = new URLSearchParams();
					if (
						// 順不同なので
						response_type === "id_token token" ||
						response_type === "token id_token"
					) {
						// Access Token も返す
						res.append("access_token", accessToken);
						res.append("token_type", "Bearer");
						res.append("expires_in", ACCESS_TOKEN_EXPIRES_IN.toString());
					}
					const id_token = await generateIdToken({
						clientId: client_id,
						userId,
						exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRES_IN,
						authTime: oidc_auth_time,
						nonce: oidc_nonce,
						accessToken,
						privateKey: c.env.PRIVKEY_FOR_OAUTH,
					});
					res.append("id_token", id_token);
					if (state) res.append("state", state);

					if (response_mode === "query") {
						redirectTo.search = res.toString();
					} else {
						// default: fragment (Section 3.2.2.5)
						redirectTo.hash = res.toString();
					}
					return c.redirect(redirectTo.href, 302);
				})
				.catch((e: Error) => {
					redirectTo.searchParams.append("error", "server_error");
					redirectTo.searchParams.append("error_description", e.message);
					redirectTo.searchParams.append("error_uri", OAUTH_ERROR_URI);
					return c.redirect(redirectTo.href, 302);
				});
		},
	)
	.all(async (c) => {
		return c.text("Method Not Allowed", 405);
	});

export { route as oauthCallbackRoute };
