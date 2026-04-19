import * as v from "valibot";
import { OAUTH_SCOPE_REGEX } from "../../constants/oauth-external/scope";
import { ScopeIdStr } from "../../entity/oauth-external/scope";

// IdP 内部では使われていないが、 OAuth Client が使うかもしれないので定義
export const OAuthAuthorizeRequestParams = v.object({
	client_id: v.pipe(v.string(), v.nonEmpty()),
	redirect_uri: v.optional(
		v.pipe(
			v.string(),
			v.check((url) => {
				// 絶対 URL
				return URL.canParse(url);
			}, "redirect_uri must be an absolute URL"),
			v.check((url) => {
				// fragment は不可
				const parsed = new URL(url);
				return parsed.hash === "";
			}, "redirect_uri must not contain fragment"),
		),
	),
	state: v.optional(v.pipe(v.string(), v.nonEmpty())),
	response_type: v.picklist([
		"code",
		"id_token",
		"id_token token",
		"token id_token",
	]),
	scope: v.optional(
		v.pipe(
			v.string(),
			v.regex(OAUTH_SCOPE_REGEX),
			v.check((scopeStr) => {
				// 同じスコープが複数回指定されていないか
				const scopeList = scopeStr.split(" ");
				const uniqueScopeSet = new Set(scopeList);
				return uniqueScopeSet.size === scopeList.length;
			}, "scope must not contain duplicate scopes"),
			v.check((scopeStr) => {
				const scopeList = scopeStr.split(" ");
				// 仕様的には知らないスコープがある場合は無視するだけだが、スキーマ検証ではガチガチにチェックしておいて損はないので
				return scopeList.every((scope) => v.is(ScopeIdStr, scope));
			}, "scope must only contain valid scopes"),
		),
	),

	// OIDC parameters
	nonce: v.optional(v.pipe(v.string(), v.nonEmpty())),
	prompt: v.optional(
		v.picklist(["none", "login", "consent", "select_account"]),
	),
	// クエリパラメータなので文字列として
	max_age: v.optional(v.pipe(v.string(), v.digits())),
	response_mode: v.optional(v.picklist(["query", "fragment"])),
});
export type OAuthAuthorizeRequestParams = v.InferOutput<
	typeof OAuthAuthorizeRequestParams
>;
