import * as v from "valibot";

export const AccessTokenRequestParams = v.object({
	grant_type: v.pipe(v.string(), v.nonEmpty()),
	code: v.pipe(v.string(), v.nonEmpty()),
	redirect_uri: v.optional(v.pipe(v.string(), v.nonEmpty(), v.url())),
	client_id: v.optional(v.pipe(v.string(), v.nonEmpty())),
	client_secret: v.optional(v.pipe(v.string(), v.nonEmpty())),
	code_verifier: v.optional(
		v.pipe(
			v.string(),
			// RFC 7636 Section 4.1: https://www.rfc-editor.org/rfc/rfc7636#section-4.1
			v.minLength(43),
			v.maxLength(128),
			v.regex(/^[A-Za-z0-9._~-]+$/),
		),
	),
});
export type AccessTokenRequestParams = v.InferOutput<
	typeof AccessTokenRequestParams
>;

export const AccessTokenResponse = v.object({
	access_token: v.pipe(v.string(), v.nonEmpty()),
	token_type: v.literal("bearer"),
	expires_in: v.pipe(v.number(), v.integer(), v.minValue(0)),
	scope: v.pipe(v.string()),
	id_token: v.optional(v.pipe(v.string(), v.nonEmpty())),
});
export type AccessTokenResponse = v.InferOutput<typeof AccessTokenResponse>;
