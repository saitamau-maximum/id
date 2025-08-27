import type { Hono } from "hono";
import { assert, describe, it } from "vitest";
import type { ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import type { IOAuthExternalRepository } from "../../repository/oauth-external";
import type { IUserRepository } from "../../repository/user";
import type { TokenResponse } from "../../routes/oauth/accessToken";
import {
	AUTHORIZATION_ENDPOINT,
	DEFAULT_REDIRECT_URI,
	TOKEN_ENDPOINT,
	authorize,
	generateUserId,
	getUserSessionCookie,
	registerOAuthClient,
} from "./utils";

export const resourcesOAuth2Test = ({
	oauthExternalRepository,
	userRepository,
	clientScopes,
	app,
}: {
	oauthExternalRepository: IOAuthExternalRepository;
	userRepository: IUserRepository;
	clientScopes: ScopeId[];
	app: Hono<HonoEnv>;
}) => {
	describe("OAuth 2.0 spec - Accessing Protected Resources", () => {
		const getAccessToken = async () => {
			const dummyUserId = await generateUserId(userRepository);
			const validUserCookie = await getUserSessionCookie(dummyUserId);
			const oauthClientId = await registerOAuthClient(
				oauthExternalRepository,
				dummyUserId,
				clientScopes,
				[DEFAULT_REDIRECT_URI],
			);

			// Authorization Request
			const param = new URLSearchParams({
				response_type: "code",
				client_id: oauthClientId,
			});
			const authRes = await app.request(
				`${AUTHORIZATION_ENDPOINT}?${param.toString()}`,
				{ headers: { Cookie: validUserCookie } },
			);
			const authResText = await authRes.text();
			const callbackUrl = await authorize(app, authResText, validUserCookie);
			const code = callbackUrl.searchParams.get("code");
			assert.isNotNull(code);

			// Access Token Request
			const oauthClientSecret =
				await oauthExternalRepository.generateClientSecret(
					oauthClientId,
					dummyUserId,
				);
			const tokenParams = new URLSearchParams({
				grant_type: "authorization_code",
				code,
				redirect_uri: DEFAULT_REDIRECT_URI,
				client_id: oauthClientId,
				client_secret: oauthClientSecret,
			});
			const tokenRes = await app.request(TOKEN_ENDPOINT, {
				method: "POST",
				body: tokenParams,
			});
			const tokenResJson = await tokenRes.json<TokenResponse>();
			return tokenResJson.access_token;
		};

		it("accepts access token in Authorization header", () => {});

		describe("Access Token Validation [MUST]", () => {
			// The resource server MUST validate the access token and ensure that it has not expired and that its scope covers the requested resource
			it("accepts valid access token", () => {});

			it("rejects expired access token", () => {});

			it("rejects access token with insufficient scope", () => {});
		});
	});
};
