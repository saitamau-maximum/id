import type { Hono } from "hono";
import { assert, describe, expect, it, vi } from "vitest";
import { SCOPE_IDS, type ScopeId } from "../../constants/scope";
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

export interface ResourcesOAuth2TestParams {
	oauthExternalRepository: IOAuthExternalRepository;
	userRepository: IUserRepository;
	clientScopes: ScopeId[];
	app: Hono<HonoEnv>;
	path: string;
}

export const getAccessToken = async ({
	oauthExternalRepository,
	userRepository,
	clientScopes,
	app,
}: Omit<ResourcesOAuth2TestParams, "path">) => {
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
	const oauthClientSecret = await oauthExternalRepository.generateClientSecret(
		oauthClientId,
		dummyUserId,
	);
	const tokenParams = new URLSearchParams({
		grant_type: "authorization_code",
		code,
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

export const resourcesOAuth2Test = (params: ResourcesOAuth2TestParams) => {
	describe("OAuth 2.0 spec", () => {
		it("accepts access token in Authorization header", async () => {
			const accessToken = await getAccessToken(params);
			const res = await params.app.request(params.path, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			expect(res.ok).toBe(true);
		});

		describe("Access Token Validation [MUST]", () => {
			// The resource server MUST validate the access token and ensure that it has not expired and that its scope covers the requested resource
			it("rejects malformed access token", async () => {
				const res = await params.app.request(params.path, {
					headers: { Authorization: "Bearer malformed_token" },
				});
				expect(res.status).toBe(401);
			});

			it("rejects expired access token", async () => {
				const accessToken = await getAccessToken(params);
				// トークンの有効期限は 1h だが余裕をもって 1h1m 後にする
				vi.advanceTimersByTime(61 * 60 * 1000);
				const res = await params.app.request(params.path, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
				expect(res.status).toBe(401);
			});

			it("rejects access token with insufficient scope", async () => {
				if (params.clientScopes.length === 0) {
					// スコープがない場合はスキップ
					return;
				}

				const accessToken = await getAccessToken({
					...params,
					// 必要なスコープ以外を付与
					clientScopes: Object.values(SCOPE_IDS).filter(
						(scope) => !params.clientScopes.includes(scope),
					),
				});
				const res = await params.app.request(params.path, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
				expect(res.status).toBe(403);
			});
		});
	});
};
