import * as v from "valibot";

// RFC 7636: https://www.rfc-editor.org/rfc/rfc7636
export const PKCE_CODE_CHALLENGE_METHODS = ["plain", "S256"] as const;

// Section 4.2
export const PkceCodeChallenge = v.pipe(
	v.string(),
	v.minLength(43),
	v.maxLength(128),
	v.regex(/^[A-Za-z0-9._~-]+$/),
);
export type PkceCodeChallenge = v.InferOutput<typeof PkceCodeChallenge>;

export const PkceCodeChallengeMethod = v.picklist(PKCE_CODE_CHALLENGE_METHODS);
export type PkceCodeChallengeMethod = v.InferOutput<
	typeof PkceCodeChallengeMethod
>;

// Section 4.1
export const PkceCodeVerifier = v.pipe(
	v.string(),
	v.minLength(43),
	v.maxLength(128),
	v.regex(/^[A-Za-z0-9._~-]+$/),
);
export type PkceCodeVerifier = v.InferOutput<typeof PkceCodeVerifier>;
