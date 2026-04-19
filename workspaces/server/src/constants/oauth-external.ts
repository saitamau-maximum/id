export const BAD_REQUEST_RESPONSE = [
	"Bad Request",
	400,
	{
		"WWW-Authenticate":
			'Bearer realm="Maximum IdP", error="invalid_request", error_description="Invalid request"',
	},
] as const;

export const UNAUTHORIZED_RESPONSE = [
	"Unauthorized",
	401,
	{
		"WWW-Authenticate":
			'Bearer realm="Maximum IdP", error="invalid_token", error_description="Invalid access token"',
	},
] as const;

export const FORBIDDEN_RESPONSE = [
	"Forbidden",
	403,
	{
		"WWW-Authenticate":
			'Bearer realm="Maximum IdP", error="insufficient_scope", error_description="Insufficient scope for this request"',
	},
] as const;
