import { cors } from "hono/cors";
import { factory } from "../factory";
import { claimsSupported, iss } from "../utils/oauth/constant";

const app = factory.createApp();

const route = app.get("/openid-configuration", cors(), (c) => {
	return c.json(
		{
			// https://openid.net/specs/openid-connect-discovery-1_0.html に定義されている順
			issuer: iss,
			authorization_endpoint: `${iss}/oauth/authorize`,
			token_endpoint: `${iss}/oauth/access-token`,
			userinfo_endpoint: `${iss}/oauth/resources/userinfo`,
			jwks_uri: `${iss}/oauth/jwks`,
			// registration_endpoint: "", // 未実装
			scopes_supported: ["openid", "profile", "email"],
			response_types_supported: ["code", "id_token", "id_token token"],
			response_modes_supported: ["query", "fragment"],
			grant_types_supported: ["authorization_code"],
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
			token_endpoint_auth_methods_supported: ["client_secret_post"],
			token_endpoint_auth_signing_alg_values_supported: ["ES512"],
			// display_values_supported: [], // 未実装
			claim_types_supported: ["normal"],
			claims_supported: claimsSupported,
			service_documentation:
				"https://github.com/saitamau-maximum/id/wiki/oauth-docs",
			claims_locales_supported: ["ja-JP"],
			ui_locales_supported: ["ja-JP"],
			claims_parameter_supported: false, // claims parameter (OIDC Core section 5.5) は未実装
			request_parameter_supported: false, // request parameter (OIDC Core section 6) は未実装
			request_uri_parameter_supported: false, // request_uri parameter (OIDC Core section 6) は未実装
			// require_request_uri_registration: false,
			// op_policy_uri: "", // OIDC Client 向けの IdP のプライバシーポリシーなんて存在しない
			// op_tos_uri: "", // OIDC Client 向けの IdP の利用規約なんて存在しない
		},
		200,
	);
});

export { route as wellKnownRoute };
