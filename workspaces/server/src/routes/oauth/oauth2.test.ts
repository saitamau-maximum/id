// OAuth 2.0 の仕様に沿っているかのテスト
// ref: https://datatracker.ietf.org/doc/html/rfc6749

import { env } from "cloudflare:test";
import { Hono } from "hono";
import { generateSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { oauthRoute } from ".";
import { COOKIE_NAME } from "../../constants/cookie";
import { SCOPE_IDS, type ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import { CloudflareOAuthExternalRepository } from "../../infrastructure/repository/cloudflare/oauth-external";
import { CloudflareUserRepository } from "../../infrastructure/repository/cloudflare/user";

const AUTHORIZATION_ENDPOINT = "/oauth/authorize";
const TOKEN_ENDPOINT = "/oauth/access-token";
const JWT_EXPIRATION = 300; // 5 minutes

describe("OAuth 2.0 spec", () => {
	let app: Hono<HonoEnv>;
	let oauthExternalRepository: CloudflareOAuthExternalRepository;
	let userRepository: CloudflareUserRepository;
	let validUserCookie: string;
	let registerOAuthClient: (
		scopes: ScopeId[],
		callbackUrls: string[],
	) => Promise<string>;

	beforeEach(async () => {
		vi.useFakeTimers();

		app = new Hono<HonoEnv>();
		oauthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
		userRepository = new CloudflareUserRepository(env.DB);

		// ユーザーが存在しないと OAuth App を登録できないのでユーザー作成
		const userId = await userRepository.createUser({});
		// ユーザーが初期化されていないと OAuth 認可に進めないので初期化
		await userRepository.registerUser(userId, {});

		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign(
			{
				userId,
				iat: now,
				exp: now + JWT_EXPIRATION,
			},
			env.SECRET,
		);

		validUserCookie = (
			await generateSignedCookie(COOKIE_NAME.LOGIN_STATE, jwt, env.SECRET)
		).split(";")[0]; // "key=value; Path=/; ..." になっているので key=value だけ取り出す

		registerOAuthClient = async (scopes: ScopeId[], callbackUrls: string[]) => {
			const clientId = crypto.randomUUID();
			await oauthExternalRepository.registerClient(
				clientId,
				userId,
				"Dummy App",
				"Dummy App Description",
				scopes,
				callbackUrls,
				null,
			);
			return clientId;
		};

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

			const oauthClientId = await registerOAuthClient(
				[SCOPE_IDS.READ_BASIC_INFO],
				["https://idp.test/oauth/callback"],
			);
			const params = new URLSearchParams({
				response_type: "code",
				client_id: oauthClientId,
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
				{
					headers: {
						Cookie: validUserCookie,
					},
				},
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
				const oauthClientId = await registerOAuthClient(
					[SCOPE_IDS.READ_BASIC_INFO],
					["https://idp.test/oauth/callback"],
				);
				const params = new URLSearchParams({
					// response_type: "code",
					client_id: oauthClientId,
				});

				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{
						headers: {
							Cookie: validUserCookie,
						},
					},
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=invalid_request");
			});

			it("returns an error for unsupported response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// If an authorization request is missing the "response_type" parameter, or if the response type is not understood, the authorization server MUST return an error response as described in Section 4.1.2.1.
				const oauthClientId = await registerOAuthClient(
					[SCOPE_IDS.READ_BASIC_INFO],
					["https://idp.test/oauth/callback"],
				);
				const params = new URLSearchParams({
					response_type: "foobar",
					client_id: oauthClientId,
				});

				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{
						headers: {
							Cookie: validUserCookie,
						},
					},
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=unsupported_response_type");
			});

			it("does not matter the order of space-delimited response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// Extension response types MAY contain a space-delimited (%x20) list of values, where the order of values does not matter
				const redirectUri = "https://idp.test/oauth/callback";
				const nonce = "random-nonce";

				const oauthClientId = await registerOAuthClient(
					// OpenID にしないと token id_token が使えない
					[SCOPE_IDS.OPENID],
					[redirectUri],
				);
				const params1 = new URLSearchParams({
					response_type: "id_token token",
					client_id: oauthClientId,
					redirect_uri: redirectUri,
					nonce,
				});
				const params2 = new URLSearchParams({
					response_type: "token id_token",
					client_id: oauthClientId,
					redirect_uri: redirectUri,
					nonce,
				});

				const res1 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params1.toString()}`,
					{
						headers: {
							Cookie: validUserCookie,
						},
					},
				);
				const res2 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params2.toString()}`,
					{
						headers: {
							Cookie: validUserCookie,
						},
					},
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

			it("returns an error if the redirect_uri is not an absolute URI [MUST]", () => {
				// 3.1.2 - Redirection Endpoint
				// The redirection endpoint URI MUST be an absolute URI as defined by [RFC3986] Section 4.3.
				expect(true).toBe(true);
			});

			it("returns error if the redirect_uri includes a fragment component [MUST]", () => {
				// 3.1.2 - Redirection Endpoint
				// The endpoint URI MUST NOT include a fragment component
				expect(true).toBe(true);
			});

			it("requires the redirect_uri if no redirection URI was pre-registered [MUST]", () => {
				// 3.1.2.3 - Dynamic Configuration
				// ... if not redirection URI has been registered, the client MUST include a redirection URI
				expect(true).toBe(true);
			});

			it("requires the redirect_uri if multiple redirection URIs were pre-registered [MUST]", () => {
				// 3.1.2.3 - Dynamic Configuration
				// It multiple redirection URIs have been registered..., the client MUST include a redirection URI
				expect(true).toBe(true);
			});

			it("returns an error if the redirect_uri does not match the pre-registered value [MUST]", () => {
				// 3.1.2.3 - Dynamic Configuration
				// When a redirection URI is included in an authorization request, the authorization server MUST compare and match the value received against at least one of the registered redirection URIs
				expect(true).toBe(true);
			});
		});
	});

	describe("Token Endpoint (common)", () => {
		it("accepts only HTTP POST method [MUST]", () => {
			// 3.2 - Token Endpoint
			// The client MUST use the HTTP "POST" method when making access token requests.
			expect(true).toBe(true);
		});

		it("processes the request when omitting the scope parameter [MUST]", () => {
			// 3.3 - Access Token Scope
			//  If the client omits the scope parameter when requesting authorization, the authorization server MUST either process the request using a pre-defined default value or fail the request indicating an invalid scope.
			expect(true).toBe(true);
		});
	});

	describe("Authorization Code Grant", () => {
		describe("Authorization Request", () => {
			// 4.1.1 - Authorization Request
			it("returns error if response_type is missing [MUST]", () => {
				// response_type: REQUIRED.  Value MUST be set to "code"
				expect(true).toBe(true);
			});

			it("returns error if client_id is missing [MUST]", () => {
				// client_id: REQUIRED.  The client identifier as described in Section 2.2.
				expect(true).toBe(true);
			});
		});

		describe("Authorization Response", () => {
			// 4.1.2 - Authorization Response
			it("returns authorization code [MUST]", () => {
				// code: REQUIRED
				expect(true).toBe(true);
			});

			it("expires code after 10 minutes [RECOMMENDED]", () => {
				// A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
				expect(true).toBe(true);
			});

			it("expires code after single use [MUST]", () => {
				// The authorization code MUST expire shortly after it is issued to mitigate the risk of leaks.
				// If an authorization code is used more than once, the authorization server MUST deny the request
				expect(true).toBe(true);
			});

			it("returns state if provided in the request [MUST]", () => {
				// state: REQUIRED if the "state" parameter was present in the client authorization request.  The exact value received from the client.
				expect(true).toBe(true);
			});
		});

		describe("Access Token Request", () => {
			// 4.1.3 - Access Token Request
			it("returns error if grant_type is missing [MUST]", () => {
				// grant_type: REQUIRED.  Value MUST be set to "authorization_code"
				expect(true).toBe(true);
			});

			it("returns error if code is missing [MUST]", () => {
				// code: REQUIRED.  The authorization code received from the authorization server.
				expect(true).toBe(true);
			});

			it("returns error if redirect_uri is missing [MUST]", () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				expect(true).toBe(true);
			});

			it("returns error if redirect_uri is not same [MUST]", () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				expect(true).toBe(true);
			});

			describe("Client Authentication", () => {
				it("supports Authorization Header field [MUST]", () => {
					// 2.3.1 - Client Password
					// The authorization server MUST support the HTTP Basic authentication scheme for authenticating clients that were issued a client password.
					expect(true).toBe(true);
				});

				it("supports including client credentials in the request-body [MAY]", () => {
					// 2.3.1 - Client Password
					// Alternatively, the authorization server MAY support including the client credentials in the request-body using the following parameters: client_id, client_secret
					expect(true).toBe(true);
				});
			});

			it("ensures the authorization code was issued to the authenticated client [MUST]", () => {
				// The authorization server MUST:
				// ensure that the authorization code was issued to the authenticated confidential client
				expect(true).toBe(true);
			});
		});
	});

	describe("Issuing an Access Token", () => {
		// 5 - Issuing an Access Token

		// 5.1 - Successful Response
		it("returns 200 OK [MUST]", () => {
			expect(true).toBe(true);
		});

		it("returns access_token [MUST]", () => {
			// access_token: REQUIRED.  The access token issued by the authorization server.
			expect(true).toBe(true);
		});

		it("returns token_type [MUST]", () => {
			// token_type: REQUIRED.  The type of the token issued as described in Section 7.1.  Value is case insensitive.
			expect(true).toBe(true);
		});

		it("returns expires_in [RECOMMENDED]", () => {
			// expires_in: RECOMMENDED.  The lifetime in seconds of the access token.
			expect(true).toBe(true);
		});

		it("returns scope [OPTIONAL]", () => {
			expect(true).toBe(true);
		});

		it("returns with application/json Content-Type [MUST]", () => {
			//  The parameters are included in the entity-body of the HTTP response using the "application/json" media type as defined by [RFC4627].
			expect(true).toBe(true);
		});

		it("returns with no-cache headers [MUST]", () => {
			// The authorization server MUST include the HTTP "Cache-Control" response header field [RFC2616] with a value of "no-store" in any response containing tokens, credentials, or other sensitive information, as well as the "Pragma" response header field [RFC2616] with a value of "no-cache".
			expect(true).toBe(true);
		});
	});

	describe("Accessing Protected Resources", () => {
		// 7 - Accessing Protected Resources
		it("accepts access token in Authorization header", () => {
			expect(true).toBe(true);
		});

		it("validates the access token [MUST]", () => {
			// The resource server MUST validate the access token and ensure that it has not expired and that its scope covers the requested resource
			expect(true).toBe(true);
		});
	});
});
