// https://datatracker.ietf.org/doc/html/rfc6749#appendix-A.4
export const OAUTH_SCOPE_REGEX =
	/^[\x21\x23-\x5B\x5D-\x7E]+(?:\x20+[\x21\x23-\x5B\x5D-\x7E]+)*$/u;

export const ALLOWED_RESPONSE_TYPES = [
	"code",
	"id_token",
	"id_token token",
	"token id_token", // 順序は問われないので
] as const;

export const ALLOWED_PROMPT_VALUES = [
	"none",
	"login",
	"consent",
	"select_account",
] as const;

export const ALLOWED_RESPONSE_MODES = ["query", "fragment"] as const;
