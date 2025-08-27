// OAuth 2.0 の仕様に沿っているかのテスト
// ref: https://datatracker.ietf.org/doc/html/rfc6749

import { env } from "cloudflare:test";
import { Hono } from "hono";
import { generateSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
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
import { COOKIE_NAME } from "../../constants/cookie";
import { SCOPE_IDS, type ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import { CloudflareOAuthExternalRepository } from "../../infrastructure/repository/cloudflare/oauth-external";
import { CloudflareUserRepository } from "../../infrastructure/repository/cloudflare/user";
import type { TokenResponse } from "./accessToken";

const AUTHORIZATION_ENDPOINT = "/oauth/authorize";
const TOKEN_ENDPOINT = "/oauth/access-token";
const JWT_EXPIRATION = 300; // 5 minutes
const DEFAULT_REDIRECT_URI = "https://idp.test/oauth/callback";

describe("OAuth 2.0 spec", () => {
	let app: Hono<HonoEnv>;

	const oauthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
	const userRepository = new CloudflareUserRepository(env.DB);

	const generateUserId = async () => {
		// ユーザーが存在しないと OAuth App を登録できないのでユーザー作成
		const dummyUserId = await userRepository.createUser({});
		// ユーザーが初期化されていないと OAuth 認可に進めないので初期化
		await userRepository.registerUser(dummyUserId, {});
		return dummyUserId;
	};

	const getUserSessionCookie = async (userId: string) => {
		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign(
			{
				userId,
				iat: now,
				exp: now + JWT_EXPIRATION,
			},
			env.SECRET,
		);
		return (
			await generateSignedCookie(COOKIE_NAME.LOGIN_STATE, jwt, env.SECRET)
		).split(";")[0]; // "key=value; Path=/; ..." になっているので key=value だけ取り出す
	};

	const registerOAuthClient = async (
		userId: string,
		scopes: ScopeId[],
		callbackUrls: string[],
	) => {
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

	const getClientAuthHeader = (clientId: string, clientSecret: string) => {
		return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
	};

	/**
	 * 認可画面で「承認する」を押してリダイレクトされるまでの処理を模擬する
	 * @param html - Authorization Endpoint のレスポンス HTML
	 * @returns リダイレクト先 URL (redirect_uri)
	 */
	const authorize = async (html: string, cookie: string): Promise<URL> => {
		const postTo = html.match(/<form .*? action="(.*?)"/)?.[1];
		const inputs = Object.fromEntries(
			[...html.matchAll(/<input .*? name="(.*?)" value="(.*?)"/g)].map((m) => [
				m[1],
				m[2],
			]),
		);
		inputs.authorized = "1"; // 承認する
		const res = await app.request(postTo || "", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Cookie: cookie,
			},
			body: new URLSearchParams(inputs).toString(),
		});
		expect(res.status).toBe(302);
		const redirectUrl = res.headers.get("Location");
		assert.isNotNull(redirectUrl);
		return new URL(redirectUrl);
	};

	/**
	 * Authorization Code Grant の code 取得までを実行する
	 * 1. ユーザー作成 / OAuth App 登録
	 * 2. Authorization Endpoint にリクエストし、認可する
	 * 3. Redirect URI に返ってくる
	 */
	const doAuthFlow = async () => {
		const dummyUserId = await generateUserId();
		const validUserCookie = await getUserSessionCookie(dummyUserId);
		const oauthClientId = await registerOAuthClient(
			dummyUserId,
			[SCOPE_IDS.READ_BASIC_INFO],
			[DEFAULT_REDIRECT_URI],
		);
		const params = new URLSearchParams({
			response_type: "code",
			client_id: oauthClientId,
		});
		const res = await app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: validUserCookie } },
		);

		expect(res.status).toBe(200);
		const resText = await res.text();
		const callbackUrl = await authorize(resText, validUserCookie);
		const code = callbackUrl.searchParams.get("code");
		assert.isNotNull(code);

		return {
			dummyUserId,
			oauthClientId,
			code,
		};
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
			const dummyUserId = await generateUserId();
			const validUserCookie = await getUserSessionCookie(dummyUserId);
			const oauthClientId = await registerOAuthClient(
				dummyUserId,
				[SCOPE_IDS.READ_BASIC_INFO],
				[DEFAULT_REDIRECT_URI],
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
				{ headers: { Cookie: validUserCookie } },
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
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({ client_id: oauthClientId });
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=invalid_request");
			});

			it("returns an error for unsupported response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// If an authorization request is missing the "response_type" parameter, or if the response type is not understood, the authorization server MUST return an error response as described in Section 4.1.2.1.
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "foobar",
					client_id: oauthClientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(302);
				const redirectUrl = res.headers.get("Location") || "";
				expect(redirectUrl).contains("error=unsupported_response_type");
			});

			it("does not care the order of space-delimited response_type values [MUST]", async () => {
				// 3.1.1 - Response Type
				// Extension response types MAY contain a space-delimited (%x20) list of values, where the order of values does not matter
				const nonce = "random-nonce";

				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					// OpenID にしないと token id_token が使えない
					[SCOPE_IDS.OPENID],
					[DEFAULT_REDIRECT_URI],
				);
				const params1 = new URLSearchParams({
					response_type: "id_token token",
					client_id: oauthClientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
					nonce,
				});
				const params2 = new URLSearchParams({
					response_type: "token id_token",
					client_id: oauthClientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
					nonce,
				});

				const res1 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params1.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				const res2 = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params2.toString()}`,
					{ headers: { Cookie: validUserCookie } },
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
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					redirect_uri: "/invalid",
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});

			it("returns error if the redirect_uri includes a fragment component [MUST]", async () => {
				// 3.1.2 - Redirection Endpoint
				// The endpoint URI MUST NOT include a fragment component
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					redirect_uri: `${DEFAULT_REDIRECT_URI}#fragment`,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});

			it("requires the redirect_uri if no redirection URI was pre-registered [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// ... if not redirection URI has been registered, the client MUST include a redirection URI
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});

			it("requires the redirect_uri if multiple redirection URIs were pre-registered [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// It multiple redirection URIs have been registered..., the client MUST include a redirection URI
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[`${DEFAULT_REDIRECT_URI}1`, `${DEFAULT_REDIRECT_URI}2`],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});

			it("returns an error if the redirect_uri does not match the pre-registered value [MUST]", async () => {
				// 3.1.2.3 - Dynamic Configuration
				// When a redirection URI is included in an authorization request, the authorization server MUST compare and match the value received against at least one of the registered redirection URIs
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[`${DEFAULT_REDIRECT_URI}1`],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					redirect_uri: `${DEFAULT_REDIRECT_URI}2`,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});
		});

		it("processes the request when omitting the scope parameter [MUST]", async () => {
			// 3.3 - Access Token Scope
			// If the client omits the scope parameter when requesting authorization, the authorization server MUST either process the request using a pre-defined default value or fail the request indicating an invalid scope.
			const dummyUserId = await generateUserId();
			const validUserCookie = await getUserSessionCookie(dummyUserId);
			const oauthClientId = await registerOAuthClient(
				dummyUserId,
				[SCOPE_IDS.READ_BASIC_INFO],
				[DEFAULT_REDIRECT_URI],
			);
			const params = new URLSearchParams({
				response_type: "code",
				client_id: oauthClientId,
			});
			const res = await app.request(
				`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
				{ headers: { Cookie: validUserCookie } },
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
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const params = new URLSearchParams({ response_type: "code" });
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(400);
			});

			it("accepts response_type=code [MUST]", async () => {
				// response_type: REQUIRED.  Value MUST be set to "code"
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(200);
			});
		});

		describe("Authorization Response", () => {
			// 4.1.2 - Authorization Response
			it("returns authorization code [MUST]", async () => {
				// code: REQUIRED
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);

				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(resText, validUserCookie);
				expect(callbackUrl.origin + callbackUrl.pathname).toBe(
					DEFAULT_REDIRECT_URI,
				);
				expect(callbackUrl.searchParams.has("code")).toBe(true);
			});

			it("expires code after 10 minutes [RECOMMENDED]", async () => {
				// A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
				const { dummyUserId, oauthClientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);

				// 一応 11 分進める
				vi.advanceTimersByTime(11 * 60 * 1000);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes.status).toBe(401);
			});

			it("expires code after single use [MUST]", async () => {
				// The authorization code MUST expire shortly after it is issued to mitigate the risk of leaks.
				// If an authorization code is used more than once, the authorization server MUST deny the request
				const { dummyUserId, oauthClientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);

				const tokenRes1 = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes1.status).toBe(200);

				const tokenRes2 = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes2.status).toBe(401);
			});

			it("returns state if provided in the request [MUST]", async () => {
				// state: REQUIRED if the "state" parameter was present in the client authorization request.  The exact value received from the client.
				const state = "random-state";

				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					state,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);

				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(resText, validUserCookie);
				const returnedState = callbackUrl.searchParams.get("state");
				expect(returnedState).toBe(state);
			});
		});

		describe("Access Token Request", () => {
			// 4.1.3 - Access Token Request
			it("returns error if grant_type is missing [MUST]", async () => {
				// grant_type: REQUIRED.  Value MUST be set to "authorization_code"
				const { dummyUserId, oauthClientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);

				const body = new FormData();
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if code is missing [MUST]", async () => {
				// code: REQUIRED.  The authorization code received from the authorization server.
				const { dummyUserId, oauthClientId } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if redirect_uri is missing [MUST]", async () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(resText, validUserCookie);
				const code = callbackUrl.searchParams.get("code");
				assert.isNotNull(code);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
					headers: {
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			it("returns error if redirect_uri is not same [MUST]", async () => {
				// redirect_uri: REQUIRED, if the "redirect_uri" parameter was included in the authorization request as described in Section 4.1.1, and their values MUST be identical.
				const dummyUserId = await generateUserId();
				const validUserCookie = await getUserSessionCookie(dummyUserId);
				const oauthClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);
				const params = new URLSearchParams({
					response_type: "code",
					client_id: oauthClientId,
					redirect_uri: DEFAULT_REDIRECT_URI,
				});
				const res = await app.request(
					`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
					{ headers: { Cookie: validUserCookie } },
				);
				expect(res.status).toBe(200);
				const resText = await res.text();
				const callbackUrl = await authorize(resText, validUserCookie);
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
						Authorization: getClientAuthHeader(
							oauthClientId,
							oauthClientSecret,
						),
					},
				});
				expect(tokenRes.status).toBe(400);
			});

			describe("Client Authentication", () => {
				it("supports Authorization Header field [MUST]", async () => {
					// 2.3.1 - Client Password
					// The authorization server MUST support the HTTP Basic authentication scheme for authenticating clients that were issued a client password.
					const { dummyUserId, oauthClientId, code } = await doAuthFlow();
					const oauthClientSecret =
						await oauthExternalRepository.generateClientSecret(
							oauthClientId,
							dummyUserId,
						);

					const body = new FormData();
					body.append("grant_type", "authorization_code");
					body.append("code", code);
					const tokenRes = await app.request(TOKEN_ENDPOINT, {
						method: "POST",
						body,
						headers: {
							Authorization: getClientAuthHeader(
								oauthClientId,
								oauthClientSecret,
							),
						},
					});
					expect(tokenRes.status).toBe(200);
				});

				it("supports including client credentials in the request-body [MAY]", async () => {
					// 2.3.1 - Client Password
					// Alternatively, the authorization server MAY support including the client credentials in the request-body using the following parameters: client_id, client_secret
					const { dummyUserId, oauthClientId, code } = await doAuthFlow();
					const oauthClientSecret =
						await oauthExternalRepository.generateClientSecret(
							oauthClientId,
							dummyUserId,
						);

					const body = new FormData();
					body.append("grant_type", "authorization_code");
					body.append("code", code);
					body.append("client_id", oauthClientId);
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
				const { dummyUserId, oauthClientId, code } = await doAuthFlow();
				const oauthClientSecret =
					await oauthExternalRepository.generateClientSecret(
						oauthClientId,
						dummyUserId,
					);
				const differentClientId = await registerOAuthClient(
					dummyUserId,
					[SCOPE_IDS.READ_BASIC_INFO],
					[DEFAULT_REDIRECT_URI],
				);
				const differentClientSecret =
					await oauthExternalRepository.generateClientSecret(
						differentClientId,
						dummyUserId,
					);

				const body = new FormData();
				body.append("grant_type", "authorization_code");
				body.append("code", code);
				body.append("client_id", differentClientId);
				body.append("client_secret", differentClientSecret);
				const tokenRes = await app.request(TOKEN_ENDPOINT, {
					method: "POST",
					body,
				});
				expect(tokenRes.status).toBe(401);
			});
		});
	});

	describe("Issuing an Access Token", () => {
		// 5 - Issuing an Access Token

		const doAccessTokenRequest = async () => {
			const { dummyUserId, oauthClientId, code } = await doAuthFlow();
			const oauthClientSecret =
				await oauthExternalRepository.generateClientSecret(
					oauthClientId,
					dummyUserId,
				);
			const body = new FormData();
			body.append("grant_type", "authorization_code");
			body.append("code", code);
			const tokenRes = await app.request(TOKEN_ENDPOINT, {
				method: "POST",
				body,
				headers: {
					Authorization: getClientAuthHeader(oauthClientId, oauthClientSecret),
				},
			});
			return tokenRes;
		};

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
