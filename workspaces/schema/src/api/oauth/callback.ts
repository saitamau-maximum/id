import * as v from "valibot";
import {
	ALLOWED_RESPONSE_MODES,
	ALLOWED_RESPONSE_TYPES,
	OAUTH_SCOPE_REGEX,
} from "../../constants/oauth-external";

export const OAuthCallbackRequestParams = v.object({
	// hidden fields
	client_id: v.pipe(v.string(), v.nonEmpty()),
	response_type: v.picklist(ALLOWED_RESPONSE_TYPES),
	response_mode: v.optional(v.picklist(ALLOWED_RESPONSE_MODES)),
	redirect_uri: v.optional(v.pipe(v.string(), v.url())),
	scope: v.optional(v.pipe(v.string(), v.regex(OAUTH_SCOPE_REGEX))),
	state: v.optional(v.string()),
	oidc_nonce: v.optional(v.pipe(v.string(), v.nonEmpty())),
	oidc_auth_time: v.optional(v.pipe(v.string(), v.digits(), v.toNumber())),
	code_challenge: v.optional(
		v.pipe(
			v.string(),
			// RFC 7636 Section 4.2: https://www.rfc-editor.org/rfc/rfc7636#section-4.2
			v.minLength(43),
			v.maxLength(128),
			v.regex(/^[A-Za-z0-9._~-]+$/),
		),
	),
	code_challenge_method: v.optional(v.literal("S256")),

	// form で送られるので string になる
	time: v.pipe(v.string(), v.nonEmpty(), v.digits(), v.toNumber()),
	auth_token: v.pipe(v.string(), v.nonEmpty(), v.base64()),

	authorized: v.union([v.literal("1"), v.literal("0")]),
});
export type OAuthCallbackRequestParams = v.InferOutput<
	typeof OAuthCallbackRequestParams
>;

export const OAuthCallbackResponse = v.intersect([
	// common
	v.object({
		state: v.optional(v.pipe(v.string(), v.nonEmpty())),
		error: v.optional(v.pipe(v.string(), v.nonEmpty())),
		error_description: v.optional(v.string()),
		error_uri: v.optional(v.pipe(v.string(), v.url())),
	}),
	v.union([
		// response_type: code
		v.object({
			code: v.pipe(v.string(), v.nonEmpty()),
		}),
		// response_type: id_token
		v.object({
			id_token: v.pipe(v.string(), v.nonEmpty()),
		}),
		// response_type: id_token token
		v.object({
			id_token: v.pipe(v.string(), v.nonEmpty()),
			access_token: v.pipe(v.string(), v.nonEmpty()),
			token_type: v.literal("Bearer"),
			expires_in: v.pipe(v.string(), v.digits()),
		}),
	]),
]);
export type OAuthCallbackResponse = v.InferOutput<typeof OAuthCallbackResponse>;
