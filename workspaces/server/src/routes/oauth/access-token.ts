import { vValidator } from "@hono/valibot-validator";
import {
	AccessTokenRequestParams,
	type AccessTokenResponse,
} from "@idp/schema/api/oauth/access-token";
import { SCOPE_IDS } from "@idp/schema/entity/oauth-external/scope";
import { factory } from "../../factory";
import { binaryToBase64Url } from "../../utils/oauth/convert-bin-base64";
import { generateIdToken } from "../../utils/oauth/oidc-logic";

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

const app = factory.createApp();

const OAUTH_ERROR_URI =
	"https://github.com/saitamau-maximum/id/wiki/oauth-errors#access-token-endpoint";

const generateCodeChallenge = async (codeVerifier: string) => {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(codeVerifier),
	);
	return binaryToBase64Url(new Uint8Array(hash));
};

const route = app
	.post(
		"/",
		vValidator("form", AccessTokenRequestParams, async (res, c) => {
			if (!res.success)
				return c.json(
					{
						error: "invalid_request",
						error_description: "Invalid Parameters",
						error_uri: OAUTH_ERROR_URI,
					},
					400,
				);
		}),
		async (c) => {
			const { code, grant_type, redirect_uri, code_verifier } =
				c.req.valid("form");

			const { client_id, client_secret, errorRes } = (() => {
				const { client_id, client_secret } = c.req.valid("form");
				// もし POST body に client_id, client_secret があればそれを使う
				if (client_id && client_secret) return { client_id, client_secret };

				// Authorization ヘッダをチェック
				const authHeader = c.req.header("Authorization");
				if (!authHeader || !authHeader.startsWith("Basic ")) {
					return {
						errorRes: c.json(
							{
								error: "invalid_request",
								error_description: "Missing client_id or client_secret",
								error_uri: OAUTH_ERROR_URI,
							},
							401,
						),
					};
				}

				const base64Credentials = authHeader.slice(6); // "Basic " を除去
				try {
					const parts = atob(base64Credentials)
						.split(":")
						.map((s) => s.trim());
					if (parts.length !== 2 || !parts[0] || !parts[1])
						throw new Error("Invalid format"); // 下の catch でレスポンスを返す

					const [clientId, clientSecret] = parts;
					return {
						client_id: decodeURIComponent(clientId),
						client_secret: decodeURIComponent(clientSecret),
					};
				} catch {
					return {
						errorRes: c.json(
							{
								error: "invalid_request",
								error_description: "Invalid Authorization Header",
								error_uri: OAUTH_ERROR_URI,
							},
							400,
						),
					};
				}
			})();
			if (errorRes) return errorRes;

			const nowUnixMs = Date.now();

			const tokenInfo =
				await c.var.OAuthExternalRepository.getTokenByCode(code);

			// Token が見つからない場合
			if (!tokenInfo) {
				return c.json(
					{
						error: "invalid_grant",
						error_description: "Invalid Code (Not Found, Expired, etc)",
						error_uri: OAUTH_ERROR_URI,
					},
					401,
				);
			}

			// redirect_uri 一致チェック
			if (
				(redirect_uri && tokenInfo.redirectUri !== redirect_uri) ||
				(!redirect_uri && tokenInfo.redirectUri)
			) {
				return c.json(
					{
						error: "invalid_request",
						error_description: "Redirect URI mismatch",
						error_uri: OAUTH_ERROR_URI,
					},
					400,
				);
			}

			// client id, secret のペアが存在するかチェック
			if (
				tokenInfo.client.id !== client_id ||
				!client_secret ||
				!(await c.var.OAuthExternalRepository.verifyClientSecret(
					client_id,
					client_secret,
				))
			) {
				return c.json(
					{
						error: "invalid_client",
						error_description: "Invalid client_id or client_secret",
						error_uri: OAUTH_ERROR_URI,
					},
					401,
				);
			}

			if (tokenInfo.codeChallenge) {
				if (!code_verifier) {
					return c.json(
						{
							error: "invalid_grant",
							error_description: "Missing code_verifier",
							error_uri: OAUTH_ERROR_URI,
						},
						401,
					);
				}
				if (tokenInfo.codeChallengeMethod !== "S256") {
					return c.json(
						{
							error: "invalid_grant",
							error_description: "Unsupported code_challenge_method",
							error_uri: OAUTH_ERROR_URI,
						},
						401,
					);
				}
				const codeChallenge = await generateCodeChallenge(code_verifier);
				if (codeChallenge !== tokenInfo.codeChallenge) {
					return c.json(
						{
							error: "invalid_grant",
							error_description: "Invalid code_verifier",
							error_uri: OAUTH_ERROR_URI,
						},
						401,
					);
				}
			}

			// grant_type チェック
			if (grant_type !== "authorization_code") {
				return c.json(
					{
						error: "unsupported_grant_type",
						error_description: "grant_type must be authorization_code",
						error_uri: OAUTH_ERROR_URI,
					},
					400,
				);
			}

			// token が使われたことを記録
			try {
				const consumed = await c.var.OAuthExternalRepository.consumeCode(code);
				if (!consumed) {
					await c.var.OAuthExternalRepository.deleteTokenById(tokenInfo.id);
					return c.json(
						{
							error: "invalid_grant",
							error_description: "Invalid Code (Already Used)",
							error_uri: OAUTH_ERROR_URI,
						},
						401,
					);
				}
			} catch {
				return c.json(
					{
						error: "server_error",
						error_description: "Failed to set code used",
						error_uri: OAUTH_ERROR_URI,
					},
					500,
				);
			}

			// token の残り時間を計算
			const remMs = tokenInfo.accessTokenExpiresAt.getTime() - nowUnixMs;

			const res: AccessTokenResponse = {
				access_token: tokenInfo.accessToken,
				token_type: "bearer",
				expires_in: Math.floor(remMs / 1000),
				scope: tokenInfo.scopes.map((s) => s.name).join(" "),
			};

			if (tokenInfo.scopes.some((s) => s.id === SCOPE_IDS.OPENID)) {
				const userInfo = await c.var.UserRepository.fetchUserProfileById(
					tokenInfo.userId,
				);

				res.id_token = await generateIdToken({
					clientId: tokenInfo.clientId,
					userId: tokenInfo.userId,
					exp: Math.floor(tokenInfo.accessTokenExpiresAt.getTime() / 1000),
					authTime: tokenInfo.oidcParams.authTime,
					nonce: tokenInfo.oidcParams.nonce,
					accessToken: tokenInfo.accessToken,
					privateKey: c.env.PRIVKEY_FOR_OAUTH,
					// 必要最低限の情報は含める
					...(tokenInfo.scopes.find((s) => s.id === SCOPE_IDS.PROFILE)
						? {
								name: userInfo.realName,
								nickname: userInfo.displayName,
								preferred_username: userInfo.displayId,
								picture: userInfo.profileImageURL,
							}
						: {}),
					...(tokenInfo.scopes.find((s) => s.id === SCOPE_IDS.EMAIL)
						? {
								email: userInfo.email,
							}
						: {}),
				});
			}

			return c.json<AccessTokenResponse>(res, 200);
		},
	)
	.all("/", async (c) => {
		return c.text("method not allowed", 405);
	});

export { route as oauthAccessTokenRoute };
