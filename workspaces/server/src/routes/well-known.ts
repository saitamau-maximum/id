import {
	ALLOWED_RESPONSE_MODES,
	ALLOWED_RESPONSE_TYPES,
} from "@idp/schema/constants/oauth-external";
import { PKCE_CODE_CHALLENGE_METHODS } from "@idp/schema/entity/oauth-external/pkce";
import { SCOPES_BY_ID } from "@idp/schema/entity/oauth-external/scope";
import { cors } from "hono/cors";
import { factory } from "../factory";
import { claimsSupported, iss } from "../utils/oauth/constant";

const app = factory.createApp();
app.use(cors());

const scopesSupported = Object.values(SCOPES_BY_ID).map((scope) => scope.name);

// RFC 8414 Section 2: https://www.rfc-editor.org/rfc/rfc8414#section-2
const oauthAuthorizationServerMetadata = {
	issuer: iss,
	authorization_endpoint: `${iss}/oauth/authorize`,
	token_endpoint: `${iss}/oauth/access-token`,
	jwks_uri: `${iss}/oauth/jwks`,
	// registration_endpoint: "", // 未実装
	scopes_supported: scopesSupported,
	response_types_supported: ALLOWED_RESPONSE_TYPES,
	response_modes_supported: ALLOWED_RESPONSE_MODES,
	grant_types_supported: ["authorization_code"],
	token_endpoint_auth_methods_supported: [
		"client_secret_basic",
		"client_secret_post",
	],
	// token_endpoint_auth_signing_alg_values_supported: [], // 未実装
	service_documentation:
		"https://github.com/saitamau-maximum/id/wiki/oauth-docs",
	ui_locales_supported: ["ja-JP"],
	// 以下未実装
	// op_policy_uri: "",
	// op_tos_uri: "",
	// revocation_endpoint: "",
	// revocation_endpoint_auth_methods_supported: [],
	// revocation_endpoint_auth_signing_alg_values_supported: [],
	// introspection_endpoint: "",
	// introspection_endpoint_auth_methods_supported: [],
	// introspection_endpoint_auth_signing_alg_values_supported: [],
	code_challenge_methods_supported: PKCE_CODE_CHALLENGE_METHODS,
} as const;

// OpenID Connect Discovery Section 3: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
const openidProviderMetadata = {
	...oauthAuthorizationServerMetadata,
	userinfo_endpoint: `${iss}/oauth/resources/userinfo`,
	// acr_values_supported: [], // 不使用
	subject_types_supported: ["pairwise"],
	id_token_signing_alg_values_supported: ["ES512"],
	// id_token_encryption_alg_values_supported: [], // 暗号化は未実装
	// id_token_encryption_enc_values_supported: [],
	userinfo_signing_alg_values_supported: ["none"], // userinfo は JSON として返されるので署名なし
	// userinfo_encryption_alg_values_supported: [], // 暗号化は未実装
	// userinfo_encryption_enc_values_supported: [],
	// request_object_signing_alg_values_supported: [], // request object は未実装
	// request_object_encryption_alg_values_supported: [],
	// request_object_encryption_enc_values_supported: [],
	// display_values_supported: [], // 未実装
	claim_types_supported: ["normal"],
	claims_supported: claimsSupported,
	claims_locales_supported: ["ja-JP"],
	claims_parameter_supported: false, // claims parameter (OIDC Core section 5.5) は未実装
	request_parameter_supported: false, // request parameter (OIDC Core section 6) は未実装
	request_uri_parameter_supported: false, // request_uri parameter (OIDC Core section 6) は未実装
	// require_request_uri_registration: false,
} as const;

const route = app
	.get("/openid-configuration", (c) => {
		return c.json(openidProviderMetadata, 200);
	})
	// RFC 8414 Section 3.1: https://www.rfc-editor.org/rfc/rfc8414#section-3.1
	.get("/oauth-authorization-server", (c) => {
		return c.json(oauthAuthorizationServerMetadata, 200);
	});

export { route as wellKnownRoute };
