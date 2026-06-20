import { vValidator } from "@hono/valibot-validator";
import { OAuthCallbackRequestParams } from "@idp/schema/api/oauth/callback";
import { factory } from "../../factory";
import { cookieAuthMiddleware } from "../../middleware/auth";
import { validateAuthToken } from "../../utils/oauth/auth-token";
import { derivePublicKey, importKey, jwkToKey } from "../../utils/oauth/key";
import {
	createAuthorizationSuccessRedirect,
	OAUTH_ERROR_URI,
} from "./authorization-success";

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

const app = factory.createApp();

const route = app
	.post(
		"/",
		cookieAuthMiddleware,
		vValidator("form", OAuthCallbackRequestParams, (res, c) => {
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
				oidc_auth_time,
				code_challenge,
				code_challenge_method,
				time,
				auth_token,
				authorized,
			} = c.req.valid("form");
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
				codeChallenge: code_challenge,
				codeChallengeMethod: code_challenge_method,
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

			return await createAuthorizationSuccessRedirect(c, {
				clientId: client_id,
				userId,
				responseType: response_type,
				responseMode: response_mode,
				redirectUri: redirect_uri,
				scope,
				state,
				oidcNonce: oidc_nonce,
				oidcAuthTime: oidc_auth_time,
				codeChallenge: code_challenge,
				codeChallengeMethod: code_challenge_method,
				saveGrant: true,
			}).catch((e: Error) => {
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
