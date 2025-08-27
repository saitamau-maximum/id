// OAuth 2.0 の仕様に沿っているかのテスト
// ref: https://datatracker.ietf.org/doc/html/rfc6749

import { env } from "cloudflare:test";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import {
	assert,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { oauthRoute } from ".";
import { SCOPE_IDS, type ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import { CloudflareOAuthExternalRepository } from "../../infrastructure/repository/cloudflare/oauth-external";
import { CloudflareUserRepository } from "../../infrastructure/repository/cloudflare/user";
import {
	AUTHORIZATION_ENDPOINT,
	DEFAULT_REDIRECT_URI,
	TOKEN_ENDPOINT,
	authorize,
	oauthTestsCommonSetup,
	registerOAuthClient,
} from "../../tests/oauth/utils";
import type { TokenResponse } from "./accessToken";

describe("OAuth 2.0 spec", () => {
	let app: Hono<HonoEnv>;

	const oauthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
	const userRepository = new CloudflareUserRepository(env.DB);

	// wrapper
	const setup = (scopes: ScopeId[], callbackUrls: string[]) =>
		oauthTestsCommonSetup(
			oauthExternalRepository,
			userRepository,
			scopes,
			callbackUrls,
		);

	const getClientAuthHeader = (clientId: string, clientSecret: string) => {
		return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
	};

	/**
	 * Authorization Code Grant の code 取得までを実行する
	 * 1. ユーザー作成 / OAuth App 登録
	 * 2. Authorization Endpoint にリクエストし、認可する
	 * 3. Redirect URI に返ってくる
	 */
	const doAuthFlow = async () => {
		const { userId, cookie, clientId } = await setup(
			[SCOPE_IDS.READ_BASIC_INFO],
			[DEFAULT_REDIRECT_URI],
		);
		const params = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
		});
		const res = await app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: cookie } },
		);

		expect(res.status).toBe(200);
		const resText = await res.text();
		const callbackUrl = await authorize(app, resText, cookie);
		const code = callbackUrl.searchParams.get("code");
		assert.isNotNull(code);

		return {
			userId,
			clientId,
			code,
		};
	};

	const doAccessTokenRequest = async () => {
		const { userId, clientId, code } = await doAuthFlow();
		const oauthClientSecret =
			await oauthExternalRepository.generateClientSecret(clientId, userId);
		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		const tokenRes = await app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		return tokenRes;
	};

	beforeEach(async () => {
		vi.useFakeTimers();

		app = new Hono<HonoEnv>();

		// 環境変数とリポジトリを注入するミドルウェア
		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.env = env;
			c.set("OAuthExternalRepository", oauthExternalRepository);
			c.set("UserRepository", userRepository);
			await next();
		});

		app.use(repositoryInjector).route("/oauth", oauthRoute);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("Authorization Endpoint (common)", () => {
		it("verifies the identity of the resource owner [MUST]", async () => {
			// 3.1 - Authorization Endpoint
			// The authorization server MUST first verify the identity of the resource owner.
			const { userId, cookie, clientId } = await setup(
				[SCOPE_IDS.READ_BASIC_INFO],
				[DEFAULT_REDIRECT_URI],
			);
			const params = new URLSearchParams({
				response_type: "code",
				client_id: clientId,
			});

			// 未ログインならログインページにリダイレクトされる
			const res1 = await app.request(
				`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			);
			expect(res1.status).toBe(302);
			const redirectUrl = res1.headers.get("Location") || "";
			expect(redirectUrl).contains(`${env.CLIENT_ORIGIN}/login`);

			// ログイン済みなら認可画面へ
			const res2 = await app.request(
				`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
				{ headers: { Cookie: cookie } },
			);
			const resText = await res2.text();
			expect(res2.status).toBe(200);
			expect(resText).contains("Dummy App");
		});

		it("supports the HTTP GET method [MUST]", async () => {
			// 3.1 - Authorization Endpoint
			// The authorization server MUST support the use of the HTTP "GET" method [RFC2616] for the authorization endpoint
			const res = await app.request(AUTHORIZATION_ENDPOINT, { method: "GET" });
			expect(res.status).not.toBe(405);
		});

		// it("supports the HTTP POST method [MAY]", async () => {
		// 	// 3.1 - Authorization Endpoint
		// 	// The authorization server ... MAY support the use of the "POST" method as well.
		// 	// 未対応
		// 	const res = await app.request(AUTHORIZATION_ENDPOINT, { method: "POST" });
		// 	expect(res.status).not.toBe(405);
		// });

		describe("Response Type", () => {
			it("returns an error if the response_type is missing [MUST]", async () => {
				// 3.1.1 - Response Type
				// If an authorization request is missing the "response_type" parameter, or if the response type is not understood, the authorization server MUST return an error response as described in Section 4.1.2.1.
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({ client_id: clientId });
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=invalid_request");
			});

			it("returns an error for unsupported response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// If an authorization request is missing the "response_type" parameter, or if the response type is not understood, the authorization server MUST return an error response as described in Section 4.1.2.1.
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "foobar",
					client_id: clientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=unsupported_response_type");
			});

			it("does not care the order of space-delimited response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// Extension response types MAY contain a space-delimited (%x20) list of values, where the order of values does not matter
				const nonce = "random-nonce";

				// OpenID にしないと token id_token が使えない
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.OPENID],
					[DEFAULT_REDIRECT_URI],
				);
				const params1 = new URLSearchParams({
					response_type: "id_token token",
					client_id: clientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
					nonce,
				});
				const params2 = new URLSearchParams({
					response_type: "token id_token",
					client_id: clientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
					nonce,
				});

				const res1 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params1.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				const res2 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params2.toString()}`,
					{ headers: { Cookie: cookie } },
				);

				// text までチェックすると <input type="hidden" name="response_type" value=""> の値が違うので落ちる
				// 簡易的に status と statusText のみチェック
				expect(res1.status).toBe(res2.status);
				expect(res1.statusText).toBe(res2.statusText);
			});
		});

		describe("Redirection Endpoint Check", () => {
			// 3.1.2.4 - Invalid Endpoint
			// ... MUST NOT automatically redirect the user-agent to the invalid redirection URI

			it("returns an error if the redirect_uri is not an absolute URI [MUST]", async () => {
				// 3.1.2 - Redirection Endpoint
				// The redirection endpoint URI MUST be an absolute URI as defined by [RFC3986] Section 4.3.
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					redirect_uri: "/invalid",
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});

			it("returns error if the redirect_uri includes a fragment component [MUST]", async () => {
				// 3.1.2 - Redirection Endpoint
				// The endpoint URI MUST NOT include a fragment component
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					redirect_uri: `${DEFAULT_REDIRECT_URI}#fragment`,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});

			it("requires the redirect_uri if no redirection URI was pre-registered [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// ... if not redirection URI has been registered, the client MUST include a redirection URI
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});

			it("requires the redirect_uri if multiple redirection URIs were pre-registered [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// It multiple redirection URIs have been registered..., the client MUST include a redirection URI
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[`${DEFAULT_REDIRECT_URI}1`, `${DEFAULT_REDIRECT_URI}2`],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});

			it("returns an error if the redirect_uri does not match the pre-registered value [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// When a redirection URI is included in an authorization request, the authorization server MUST compare and match the value received against at least one of the registered redirection URIs
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[`${DEFAULT_REDIRECT_URI}1`],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					redirect_uri: `${DEFAULT_REDIRECT_URI}2`,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});
		});

		it("processes the request when omitting the scope parameter [MUST]", async () => {
			// 3.3 - Access Token Scope
			// If the client omits the scope parameter when requesting authorization, the authorization server MUST either process the request using a pre-defined default value or fail the request indicating an invalid scope.
			const { userId, cookie, clientId } = await setup(
				[SCOPE_IDS.READ_BASIC_INFO],
				[DEFAULT_REDIRECT_URI],
			);
			const params = new URLSearchParams({
				response_type: "code",
				client_id: clientId,
			});
			const res = await app.request(
				`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
				{ headers: { Cookie: cookie } },
			);
			expect(res.status).toBe(200);
		});
	});

	describe("Token Endpoint (common)", () => {
		it("accepts only HTTP POST method [MUST]", async () => {
			// 3.2 - Token Endpoint
			// The client MUST use the HTTP "POST" method when making access token requests.
			const res_get = await app.request(TOKEN_ENDPOINT, { method: "GET" });
			expect(res_get.status).toBe(405);

			const res_post = await app.request(TOKEN_ENDPOINT, { method: "POST" });
			expect(res_post.status).not.toBe(405);
		});
	});

	describe("Authorization Code Grant", () => {
		describe("Authorization Request", () => {
			// 4.1.1 - Authorization Request
			it("returns error if client_id is missing [MUST]", async () => {
				// client_id: REQUIRED.  The client identifier as described in Section 2.2.
				const { cookie } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({ response_type: "code" });
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(400);
			});

			it("accepts response_type=code [MUST]", async () => {
				// response_type: REQUIRED.  Value MUST be set to "code"
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(200);
			});
		});

		describe("Authorization Response", () => {
			// 4.1.2 - Authorization Response
			it("returns authorization code [MUST]", async () => {
				// code: REQUIRED
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);

				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(app, resText, cookie);
				expect(callbackUrl.origin + callbackUrl.pathname).toBe(
					DEFAULT_REDIRECT_URI,
				);
				expect(callbackUrl.searchParams.has("code")).toBe(true);
			});

			it("expires code after 10 minutes [RECOMMENDED]", async () => {
				// A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
				const { userId, clientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);

				// 一応 11 分進める
				vi.advanceTimersByTime(11 * 60 * 1000);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes.status).toBe(401);
			});

			it("expires code after single use [MUST]", async () => {
				// The authorization code MUST expire shortly after it is issued to mitigate the risk of leaks.
				// If an authorization code is used more than once, the authorization server MUST deny the request
				const { userId, clientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);

				const tokenRes1 = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes1.status).toBe(200);

				const tokenRes2 = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes2.status).toBe(401);
			});

			it("returns state if provided in the request [MUST]", async () => {
				// state: REQUIRED if the "state" parameter was present in the client authorization request.  The exact value received from the client.
				const state = "random-state";

				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					state,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);

				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(app, resText, cookie);
				const returnedState = callbackUrl.searchParams.get("state");
				expect(returnedState).toBe(state);
			});
		});

		describe("Access Token Request", () => {
			// 4.1.3 - Access Token Request
			it("returns error if grant_type is missing [MUST]", async () => {
				// grant_type: REQUIRED.  Value MUST be set to "authorization_code"
				const { userId, clientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);

				const body = new FormData();
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if code is missing [MUST]", async () => {
				// code: REQUIRED.  The authorization code received from the authorization server.
				const { userId, clientId } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if redirect_uri is missing [MUST]", async () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(app, resText, cookie);
				const code = callbackUrl.searchParams.get("code");
				assert.isNotNull(code);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if redirect_uri is not same [MUST]", async () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				const { userId, cookie, clientId } = await setup(
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: clientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: cookie } },
				);
				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(app, resText, cookie);
				const code = callbackUrl.searchParams.get("code");
				assert.isNotNull(code);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				body.append("redirect_uri", `${DEFAULT_REDIRECT_URI}/different`);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(clientId, oauthClientSecret),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			describe("Client Authentication", () => {
				it("supports Authorization Header field [MUST]", async () => {
					// 2.3.1 - Client Password
					// The authorization server MUST support the HTTP Basic authentication scheme for authenticating clients that were issued a client password.
					const { userId, clientId, code } = await doAuthFlow();
					const oauthClientSecret =
						await oauthExternalRepository.generateClientSecret(
							clientId,
							userId,
						);

					const body = new FormData();
					body.append("grant_type", "authorization_code");
					body.append("code", code);
					const tokenRes = await app.request(TOKEN_ENDPOINT, {
						method: "POST",
						body,
						headers: {
							Authorization: getClientAuthHeader(clientId, oauthClientSecret),
						},
					});
					expect(tokenRes.status).toBe(200);
				});

				it("supports including client credentials in the request-body [MAY]", async () => {
					// 2.3.1 - Client Password
					// Alternatively, the authorization server MAY support including the client credentials in the request-body using the following parameters: client_id, client_secret
					const { userId, clientId, code } = await doAuthFlow();
					const oauthClientSecret =
						await oauthExternalRepository.generateClientSecret(
							clientId,
							userId,
						);

					const body = new FormData();
					body.append("grant_type", "authorization_code");
					body.append("code", code);
					body.append("client_id", clientId);
					body.append("client_secret", oauthClientSecret);
					const tokenRes = await app.request(TOKEN_ENDPOINT, {
						method: "POST",
						body,
					});
					expect(tokenRes.status).toBe(200);
				});
			});

			it("ensures the authorization code was issued to the authenticated client [MUST]", async () => {
				// The authorization server MUST:
				// ensure that the authorization code was issued to the authenticated confidential client
				const { userId, clientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(clientId, userId);
				const differentClientId = await registerOAuthClient(
					oauthExternalRepository,
					userId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const differentClientSecret =
					await oauthExternalRepository.generateClientSecret(
						differentClientId,
						userId,
					);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);

				// 正しい組み合わせ以外全探索
				for (const [id, sec] of [
					[clientId, differentClientSecret],
					[differentClientId, oauthClientSecret],
					[differentClientId, differentClientSecret],
				]) {
					body.set("client_id", id);
					body.set("client_secret", sec);
					const tokenRes = await app.request(TOKEN_ENDPOINT, {
						method: "POST",
						body,
					});
					expect(tokenRes.status).toBe(401);
				}
			});
		});
	});

	describe("Issuing an Access Token", () => {
		// 5 - Issuing an Access Token

		// 5.1 - Successful Response
		it("returns 200 OK [MUST]", async () => {
			const res = await doAccessTokenRequest();
			expect(res.status).toBe(200);
		});

		it("returns access_token [MUST]", async () => {
			// access_token: REQUIRED.  The access token issued by the authorization server.
			const res = await doAccessTokenRequest();
			const json = await res.json<TokenResponse>();
			expect(json).toHaveProperty("access_token");
			expect(json.access_token).toBeTypeOf("string");
		});

		it("returns token_type [MUST]", async () => {
			// token_type: REQUIRED.  The type of the token issued as described in Section 7.1.  Value is case insensitive.
			const res = await doAccessTokenRequest();
			const json = await res.json<TokenResponse>();
			expect(json).toHaveProperty("token_type");
			expect(json.token_type).toMatch(/bearer/i); // case insensitive
		});

		it("returns expires_in [RECOMMENDED]", async () => {
			// expires_in: RECOMMENDED.  The lifetime in seconds of the access token.
			const res = await doAccessTokenRequest();
			const json = await res.json<TokenResponse>();
			expect(json).toHaveProperty("expires_in");
			expect(json.expires_in).toBeTypeOf("number");
		});

		it("returns scope [OPTIONAL]", async () => {
			const res = await doAccessTokenRequest();
			const json = await res.json<TokenResponse>();
			expect(json).toHaveProperty("scope");
			expect(json.scope).toBeTypeOf("string");
		});

		it("returns with application/json Content-Type [MUST]", async () => {
			// The parameters are included in the entity-body of the HTTP response using the "application/json" media type as defined by [RFC4627].
			const res = await doAccessTokenRequest();
			expect(res.headers.get("Content-Type")).toBe("application/json");
		});

		it("returns with no-cache headers [MUST]", async () => {
			// The authorization server MUST include the HTTP "Cache-Control" response header field [RFC2616] with a value of "no-store" in any response containing tokens, credentials, or other sensitive information, as well as the "Pragma" response header field [RFC2616] with a value of "no-cache".
			const res = await doAccessTokenRequest();
			expect(res.headers.get("Cache-Control")).toBe("no-store");
			expect(res.headers.get("Pragma")).toBe("no-cache");
		});
	});
});
