import * as v from "valibot";

export const PKCE_CODE_CHALLENGE_METHODS = ["plain", "S256"] as const;

export const PkceCodeChallenge = v.pipe(
	v.string(),
	// RFC 7636 Section 4.2: https://www.rfc-editor.org/rfc/rfc7636#section-4.2
	v.minLength(43),
	v.maxLength(128),
	v.regex(/^[A-Za-z0-9._~-]+$/),
);
export type PkceCodeChallenge = v.InferOutput<typeof PkceCodeChallenge>;

export const PkceCodeChallengeMethod = v.picklist(PKCE_CODE_CHALLENGE_METHODS);
export type PkceCodeChallengeMethod = v.InferOutput<
	typeof PkceCodeChallengeMethod
>;

export const PkceCodeVerifier = v.pipe(
	v.string(),
	// RFC 7636 Section 4.1: https://www.rfc-editor.org/rfc/rfc7636#section-4.1
	v.minLength(43),
	v.maxLength(128),
	v.regex(/^[A-Za-z0-9._~-]+$/),
);
export type PkceCodeVerifier = v.InferOutput<typeof PkceCodeVerifier>;
