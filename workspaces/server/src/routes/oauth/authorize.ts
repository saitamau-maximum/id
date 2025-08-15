import type { Context } from "hono";
import { deleteCookie, getSignedCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import * as v from "valibot";
import { COOKIE_NAME } from "../../constants/cookie";
import { OAUTH_SCOPE_REGEX } from "../../constants/oauth";
import {
	PLEASE_RELOGIN_FOR_OAUTH,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../../constants/toast";
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
		// Memo: なんかうまく型が聞いてくれないので c に明示的に型をつける
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
			const client =
				await c.var.OAuthExternalRepository.getClientById(clientId);
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
			const errorRedirect = (error: string, description: string) => {
				const callback = new URL(redirectTo);

				callback.searchParams.append("error", error);
				callback.searchParams.append("error_description", description);
				callback.searchParams.append(
					"error_uri",
					"https://github.com/saitamau-maximum/id/wiki/oauth-errors#authorization-endpoint",
				);
				if (state) callback.searchParams.append("state", state);

				return c.redirect(callback.toString(), 302);
			};

			const { output: responseType, success: success4 } = v.safeParse(
				v.pipe(v.string(), v.nonEmpty()),
				query.response_type,
			);
			if (!success4) {
				return errorRedirect("invalid_request", "response_type required");
			}
			if (responseType !== "code") {
				return errorRedirect(
					"unsupported_response_type",
					"only 'code' is supported",
				);
			}

			const { output: scope, success: success5 } = v.safeParse(
				v.optional(v.pipe(v.string(), v.regex(OAUTH_SCOPE_REGEX))),
				query.scope,
			);
			if (!success5) {
				return errorRedirect("invalid_scope", "invalid scope");
			}

			if (scope) {
				const scopes = scope.split(" ");
				const scopeSet = new Set(scope.split(" "));
				if (scopes.length !== scopeSet.size) {
					return errorRedirect(
						"invalid_scope",
						"there are duplicates in scopes",
					);
				}

				const dbScopesSet = new Set(client.scopes.map((scope) => scope.name));

				const unknownScopes = scopes.filter((scope) => !dbScopesSet.has(scope));
				if (unknownScopes.length > 0) {
					return errorRedirect(
						"invalid_scope",
						`non-registered scope(s): ${unknownScopes.join(", ")}`,
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
				);
			}

			// ----- OpenID Connect パラメータのチェック ----- //
			const { output: nonce, success: success6 } = v.safeParse(
				v.optional(v.string()),
				query.nonce,
			);
			if (!success6) {
				return errorRedirect("invalid_request", "invalid nonce");
			}
			const { output: prompt, success: success7 } = v.safeParse(
				v.optional(
					v.picklist(["none", "login", "consent", "select_account"] as const),
				),
				query.prompt,
			);
			if (!success7) {
				return errorRedirect("invalid_request", "invalid prompt");
			}
			const { output: _maxAge, success: success8 } = v.safeParse(
				// クエリパラメータなので文字列として受け取る
				v.optional(v.pipe(v.string(), v.regex(/^\d+$/))),
				query.max_age,
			);
			if (!success8) {
				return errorRedirect("invalid_request", "invalid max_age");
			}
			const maxAge = _maxAge ? Number.parseInt(_maxAge, 10) : undefined;
			// TODO: その他のパラメータもチェックする
			// 仕様的には must, must not がないので無視しても問題はない

			const nowMs = Date.now();
			const loggedInAt = await (async () => {
				const jwt = await getSignedCookie(
					c,
					c.env.SECRET,
					COOKIE_NAME.LOGIN_STATE,
				);
				if (jwt) {
					const payload = await verify(jwt, c.env.SECRET);
					if (payload) return payload.iat;
				}
				return undefined;
			})();
			const forceRelogin = () => {
				// Server 側でも再ログインを強制したいので、 cookie を削除する
				deleteCookie(c, COOKIE_NAME.LOGIN_STATE);

				// ref: middleware/auth.ts
				const requestUrl = new URL(c.req.url);

				const redirectTo = new URL("/login", c.env.CLIENT_ORIGIN);
				redirectTo.searchParams.set("continue_to", requestUrl.toString());
				redirectTo.searchParams.set(
					TOAST_SEARCHPARAM,
					ToastHashFn(PLEASE_RELOGIN_FOR_OAUTH),
				);

				return c.redirect(redirectTo.toString(), 302);
			};

			const isOidc = client.scopes.some((scope) => scope.name === "openid");
			if (isOidc && prompt === "none") {
				// 現状では同意済みフラグを持っていないので、 consent interaction を強制することになる
				// TODO: none でもうまくできるようにする
				return errorRedirect(
					"interaction_required",
					"End-User must consent to use OpenID Connect",
				);
			}
			if (isOidc && prompt === "login") {
				if (loggedInAt && loggedInAt + 20 > nowMs / 1000) {
					// ログイン直後とみなし、再ログインを不要とする
				} else {
					return forceRelogin();
				}
			}
			// Memo: prompt === consent: IdP OAuth では毎回同意を求めているので特に何もしない
			// Memo: prompt === select_account: IdP では 1 人 1 アカウント前提なので特に何もしない

			if (isOidc && maxAge) {
				if (loggedInAt && loggedInAt + maxAge < nowMs / 1000) {
					// max_age を超えているので再ログインを強制する
					return forceRelogin();
				}
			}

			// request パラメータは OpenID Connect の仕様では存在するが、現状ではサポートしない
			if (isOidc && query.request) {
				return errorRedirect(
					"request_not_supported",
					"request parameter is not supported",
				);
			}

			// ----- End OpenID Connect Parameter Check ----- //

			return {
				clientId,
				redirectUri,
				redirectTo,
				state,
				scope,
				oidcNonce: nonce,
				oidcAuthTime: loggedInAt,
				clientInfo: client,
			};
		}),
		cookieAuthMiddleware,
		async (c) => {
			const {
				clientId,
				redirectUri,
				redirectTo,
				state,
				scope,
				clientInfo,
				oidcNonce,
				oidcAuthTime,
			} = c.req.valid("query");
			const nowUnixMs = Date.now();
			const { userId } = c.get("jwtPayload");

			const privateKey = await importKey(c.env.PRIVKEY_FOR_OAUTH, "privateKey");
			const token = await generateAuthToken({
				clientId,
				redirectUri,
				scope,
				state,
				oidcNonce,
				oidcAuthTime,
				time: nowUnixMs,
				key: privateKey,
			});

			// ログインしてることを middleware でチェック済み... な想定
			const userInfo = await c.var.UserRepository.fetchUserProfileById(userId);

			// 初期登録まだ
			if (!userInfo.initializedAt) {
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
						oidcNonce,
						oidcAuthTime,
					},
					user: {
						// 初期登録済みなので displayName は必ず存在する（はず）
						displayName: userInfo.displayName ?? "",
						profileImageUrl: userInfo.profileImageURL ?? "",
					},
				}),
				subtitle: clientInfo.name,
			});

			return c.html(responseHtml);
		},
	)
	// OAuth 仕様としては POST も Optional で許容してもよい
	// 必要なら対応させるかもしれないが、今のところまあいらんやろ
	.all(async (c) => {
		return c.text("Method Not Allowed", 405);
	});

export { route as oauthAuthorizeRoute };
