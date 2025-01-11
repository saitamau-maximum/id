import type { Context } from "hono";
import { validator } from "hono/validator";
import * as v from "valibot";
import { OAUTH_SCOPE_REGEX } from "../../constants/oauth";
import { type HonoEnv, factory } from "../../factory";
import { cookieAuthMiddleware } from "../../middleware/auth";
import { generateAuthToken } from "../../utils/oauth/auth-token";
import { importKey } from "../../utils/oauth/key";
import { _Authorize } from "./_templates/authorize";
import { _Layout } from "./_templates/layout";

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/27

const app = factory.createApp();

const route = app
	.get(
		"/",
		// パラメータチェックしてからログイン処理をさせる
		// TODO: Bad Request の画面をいい感じにするかも
		// Memo: なんかうまく型が聞いてくれないので c に明示的に型をつける　おま環ですか
		validator("query", async (query, c: Context<HonoEnv>) => {
			// client_id がパラメータにあるか・複数存在しないか
			const { output: clientId, success: success1 } = v.safeParse(
				v.pipe(v.string(), v.nonEmpty()),
				query.client_id,
			);
			if (!success1) {
				return c.text("Bad Request: invalid client_id", 400);
			}

			// client_id が DB にあるか
			const client = await c.var.OAuthRepository.getClientById(clientId);
			if (!client) return c.text("Bad Request: client_id not registered", 400);

			// redirect_uri が複数ないことをチェック
			const { output: redirectUri, success: success2 } = v.safeParse(
				v.optional(v.string()),
				query.redirect_uri,
			);
			if (!success2) {
				return c.text("Bad Request: invalid redirect_uri", 400);
			}

			// redirectUri: パラメータで指定されたやつ、 null 許容
			// redirectTo: 最終的にリダイレクトするやつ、 non-null
			let redirectTo = redirectUri ?? "";

			// redirect_uri がパラメータとして与えられていない場合
			if (!redirectUri) {
				if (client.callbackUrls.length === 0) {
					return c.text("Bad Request: redirect_uri not registered", 400);
				}
				if (client.callbackUrls.length > 1) {
					return c.text("Bad Request: ambiguous redirect_uri", 400);
				}

				// DB 内に登録されているものを callback として扱う
				redirectTo = client.callbackUrls[0];
			} else {
				// 絶対 URL かチェック
				if (!URL.canParse(redirectUri)) {
					return c.text("Bad Request: invalid redirect_uri", 400);
				}

				// Redirect URI のクエリパラメータ部分は変わることを許容する
				const normalizedUri = new URL(redirectUri);
				normalizedUri.search = "";

				const registeredUri = client.callbackUrls.find(
					(callbackUrl) => callbackUrl === normalizedUri.toString(),
				);

				if (!registeredUri) {
					return c.text("Bad Request: redirect_uri not registered", 400);
				}
			}

			// redirectTo が URL-like であることを assert
			if (!URL.canParse(redirectTo)) {
				return c.text("Internal Server Error: redirect_uri is empty", 500);
			}

			const { output: state, success: success3 } = v.safeParse(
				v.optional(v.string()),
				query.state,
			);
			if (!success3) {
				return c.text("Bad Request: too many state", 400);
			}

			// ---------- 以下エラー時リダイレクトさせるやつ ---------- //
			const errorRedirect = (
				error: string,
				description: string,
				_errorUri: string,
			) => {
				const callback = new URL(redirectTo);

				callback.searchParams.append("error", error);
				callback.searchParams.append("error_description", description);
				// callback.searchParams.append("error_uri", _errorUri) // そのうちドキュメント書いておきたいね
				if (state) callback.searchParams.append("state", state);

				return c.redirect(callback.toString(), 302);
			};

			const { output: responseType, success: success4 } = v.safeParse(
				v.pipe(v.string(), v.nonEmpty()),
				query.response_type,
			);
			if (!success4) {
				return errorRedirect("invalid_request", "response_type required", "");
			}
			if (responseType !== "code") {
				return errorRedirect(
					"unsupported_response_type",
					"only 'code' is supported",
					"",
				);
			}

			const { output: scope, success: success5 } = v.safeParse(
				v.optional(v.pipe(v.string(), v.regex(OAUTH_SCOPE_REGEX))),
				query.scope,
			);
			if (!success5) {
				return errorRedirect("invalid_scope", "invalid scope", "");
			}

			if (scope) {
				const scopes = scope.split(" ");
				const scopeSet = new Set(scope.split(" "));
				if (scopes.length !== scopeSet.size) {
					return errorRedirect(
						"invalid_scope",
						"there are duplicates in scopes",
						"",
					);
				}

				const dbScopesSet = new Set(client.scopes.map((scope) => scope.name));

				const unknownScopes = scopes.filter((scope) => !dbScopesSet.has(scope));
				if (unknownScopes.length > 0) {
					return errorRedirect(
						"invalid_scope",
						`non-registered scope(s): ${unknownScopes.join(", ")}`,
						"",
					);
				}

				client.scopes = client.scopes.filter((scope) =>
					scopeSet.has(scope.name),
				);
			}

			if (client.scopes.length === 0) {
				return errorRedirect(
					"invalid_scope",
					"there must be at least one scope specified",
					"",
				);
			}

			return {
				clientId,
				redirectUri,
				redirectTo,
				state,
				scope,
				clientInfo: client,
			};
		}),
		cookieAuthMiddleware,
		async (c) => {
			const { clientId, redirectUri, redirectTo, state, scope, clientInfo } =
				c.req.valid("query");
			const nowUnixMs = Date.now();
			const { userId } = c.get("jwtPayload");

			const privateKey = await importKey(c.env.PRIVKEY_FOR_OAUTH, "privateKey");
			const token = await generateAuthToken({
				clientId,
				redirectUri,
				scope,
				state,
				time: nowUnixMs,
				key: privateKey,
			});

			// ログインしてることを middleware でチェック済み... な想定
			const userInfo = await c.var.UserRepository.fetchUserProfileById(userId);

			// 初期登録まだ
			if (!userInfo.initialized) {
				return c.text("not implemented", 503);
			}

			const responseHtml = _Layout({
				children: _Authorize({
					appName: clientInfo.name,
					appLogo: clientInfo.logoUrl,
					scopes: clientInfo.scopes.map((scope) => ({
						name: scope.name,
						description: scope.description,
					})),
					oauthFields: {
						clientId,
						redirectUri,
						redirectTo,
						state,
						scope,
						token,
						nowUnixMs,
					},
					user: {
						// 初期登録済みなので displayName は必ず存在する（はず）
						displayName: userInfo.displayName ?? "",
						profileImageUrl: userInfo.profileImageURL ?? "",
					},
				}),
				subtitle: clientInfo.name,
			});

			c.header("Cache-Control", "no-store");
			c.header("Pragma", "no-cache");
			return c.html(responseHtml);
		},
	)
	// OAuth 仕様としては POST も Optional で許容してもよい
	// 必要なら対応させるかもしれないが、今のところまあいらんやろ
	.all(async (c) => {
		return c.text("Method Not Allowed", 405);
	});

export { route as oauthAuthorizeRoute };
