import type { PkceCodeChallengeMethod } from "@idp/schema/entity/oauth-external/pkce";
import { SCOPE_IDS } from "@idp/schema/entity/oauth-external/scope";
import type { Context } from "hono";
import type { HonoEnv } from "../../factory";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../utils/oauth/constant";
import { binaryToBase64 } from "../../utils/oauth/convert-bin-base64";
import { generateIdToken } from "../../utils/oauth/oidc-logic";

export const OAUTH_ERROR_URI =
	"https://github.com/saitamau-maximum/id/wiki/oauth-errors#authorization-endpoint";

type AuthorizationSuccessParams = {
	clientId: string;
	userId: string;
	responseType: string;
	responseMode?: string;
	redirectUri?: string;
	scope?: string;
	state?: string;
	oidcNonce?: string;
	oidcAuthTime?: number;
	codeChallenge?: string;
	codeChallengeMethod?: PkceCodeChallengeMethod;
	saveGrant: boolean;
};

export const createAuthorizationSuccessRedirect = async (
	c: Context<HonoEnv>,
	{
		clientId,
		userId,
		responseType,
		responseMode,
		redirectUri,
		scope,
		state,
		oidcNonce,
		oidcAuthTime,
		codeChallenge,
		codeChallengeMethod,
		saveGrant,
	}: AuthorizationSuccessParams,
) => {
	const client = await c.var.OAuthExternalRepository.getClientById(clientId);
	if (!client) throw new Error("client not found");

	let redirectTo: URL;
	if (redirectUri) {
		redirectTo = new URL(redirectUri);
	} else {
		if (client.callbackUrls.length !== 1) {
			throw new Error("client callback not found");
		}
		redirectTo = new URL(client.callbackUrls[0]);
	}

	const requestedScopes = new Set(scope ? scope.split(" ") : []);
	const scopes = client.scopes.filter((data) => {
		if (requestedScopes.size === 0) return true;
		return requestedScopes.has(data.name);
	});

	if (saveGrant) {
		await c.var.OAuthExternalRepository.upsertGrantScopes(
			userId,
			clientId,
			scopes,
		);
	}

	const code = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)));
	const accessToken = binaryToBase64(
		crypto.getRandomValues(new Uint8Array(39)),
	);

	await c.var.OAuthExternalRepository.createAccessToken(
		clientId,
		userId,
		code,
		redirectUri,
		accessToken,
		scopes,
		codeChallenge,
		codeChallengeMethod,
		oidcNonce,
		oidcAuthTime,
	);

	if (state) redirectTo.searchParams.append("state", state);

	if (responseType === "code") {
		redirectTo.searchParams.append("code", code);
		return c.redirect(redirectTo.href, 302);
	}

	const res = new URLSearchParams();
	if (responseType === "id_token token" || responseType === "token id_token") {
		res.append("access_token", accessToken);
		res.append("token_type", "Bearer");
		res.append("expires_in", ACCESS_TOKEN_EXPIRES_IN.toString());
	}

	const userInfo = await c.var.UserRepository.fetchUserProfileById(userId);

	const idToken = await generateIdToken({
		clientId,
		userId,
		exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRES_IN,
		authTime: oidcAuthTime,
		nonce: oidcNonce,
		accessToken,
		privateKey: c.env.PRIVKEY_FOR_OAUTH,
		...(scopes.find((s) => s.id === SCOPE_IDS.PROFILE)
			? {
					name: userInfo.realName,
					nickname: userInfo.displayName,
					preferred_username: userInfo.displayId,
					picture: userInfo.profileImageURL,
				}
			: {}),
		...(scopes.find((s) => s.id === SCOPE_IDS.EMAIL)
			? {
					email: userInfo.email,
				}
			: {}),
		...(scopes.find((s) => s.id === SCOPE_IDS.READ_ROLES)
			? {
					roles: userInfo.roles.map((r) => r.slug),
				}
			: {}),
	});

	res.append("id_token", idToken);
	if (state) res.append("state", state);

	if (responseMode === "query") {
		redirectTo.search = res.toString();
	} else {
		redirectTo.hash = res.toString();
	}
	return c.redirect(redirectTo.href, 302);
};
