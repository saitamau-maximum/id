import type { OIDCUserInfo } from "@idp/schema/entity/oauth-external/oidc-userinfo";

export const claimsSupported = [
	"sub",
	"updated_at",
	"name",
	"given_name",
	"family_name",
	"nickname",
	"preferred_username",
	"profile",
	"picture",
	"website",
	"gender",
	"zoneinfo",
	"birthdate",
	"locale",
	"email",
	"email_verified",
] as const satisfies ReadonlyArray<keyof OIDCUserInfo>;

export const iss = "https://api.id.maximum.vc" as const;

export const ACCESS_TOKEN_EXPIRES_IN = 3600; // 1 hour (sec)
