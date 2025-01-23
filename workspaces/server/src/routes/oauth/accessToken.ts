import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../../factory";

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

const requestBodySchema = v.object({
	grant_type: v.pipe(v.string(), v.nonEmpty()),
	code: v.pipe(v.string(), v.nonEmpty()),
	redirect_uri: v.optional(v.pipe(v.string(), v.nonEmpty(), v.url())),
	client_id: v.pipe(v.string(), v.nonEmpty()),
	client_secret: v.pipe(v.string(), v.nonEmpty()),
});

const app = factory.createApp();

const route = app
	.post(
		"/",
		async (c, next) => {
			// もし Authorization ヘッダーがある場合は 401 を返す
			const authHeader = c.req.header("Authorization");
			if (authHeader) {
				return c.json(
					{
						error: "invalid_request",
						error_description: "Authorization header is not allowed",
						// "error_uri": "" // そのうち書く
					},
					401,
				);
			}
			return next();
		},
		vValidator("form", requestBodySchema, async (res, c) => {
			// TODO: いい感じのエラー画面を作るかも
			if (!res.success)
				return c.json(
					{
						error: "invalid_request",
						error_description: "Invalid Parameters",
						// "error_uri": "" // そのうち書く
					},
					400,
				);
		}),
		async (c) => {
			const { client_id, client_secret, code, grant_type, redirect_uri } =
				c.req.valid("form");

			c.header("Cache-Control", "no-store");
			c.header("Pragma", "no-cache");

			const nowUnixMs = Date.now();

			const tokenInfo =
				await c.var.OAuthExternalRepository.getTokenByCode(code);

			// Token が見つからない場合
			if (!tokenInfo) {
				return c.json(
					{
						error: "invalid_grant",
						error_description: "Invalid Code (Not Found, Expired, etc)",
						// "error_uri": "" // そのうち書く
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
						// "error_uri": "" // そのうち書く
					},
					400,
				);
			}

			// client id, secret のペアが存在するかチェック
			if (
				tokenInfo.client.id !== client_id ||
				!tokenInfo.client.secrets.some((s) => s.secret === client_secret)
			) {
				return c.json(
					{
						error: "invalid_client",
						error_description: "Invalid client_id or client_secret",
						// "error_uri": "" // そのうち書く
					},
					401,
				);
			}

			// grant_type チェック
			if (grant_type !== "authorization_code") {
				return c.json(
					{
						error: "unsupported_grant_type",
						error_description: "grant_type must be authorization_code",
						// "error_uri": "" // そのうち書く
					},
					400,
				);
			}

			// もしすでに token が使われていた場合
			if (tokenInfo.codeUsed) {
				// そのレコードを削除
				// delete に失敗していても response は変わらないので結果は無視する
				await c.var.OAuthExternalRepository.deleteTokenById(tokenInfo.id);
				return c.json(
					{
						error: "invalid_grant",
						error_description: "Invalid Code (Already Used)",
						// "error_uri": "" // そのうち書く
					},
					401,
				);
			}

			// token が使われたことを記録
			try {
				await c.var.OAuthExternalRepository.setCodeUsed(code);
			} catch {
				return c.json(
					{
						error: "server_error",
						error_description: "Failed to set code used",
						// "error_uri": "" // そのうち書く
					},
					500,
				);
			}

			// token の残り時間を計算
			const remMs = tokenInfo.codeExpiresAt.getTime() - nowUnixMs;

			return c.json(
				{
					access_token: tokenInfo.accessToken,
					token_type: "bearer",
					expires_in: Math.floor(remMs / 1000),
					scope: tokenInfo.scopes.map((s) => s.name).join(" "),
				},
				200,
			);
		},
	)
	.all("/", async (c) => {
		return c.text("method not allowed", 405);
	});

export { route as oauthAccessTokenRoute };
