import { env } from "cloudflare:test";
import {
	SCOPE_IDS,
	type ScopeId,
} from "@idp/schema/entity/oauth-external/scope";
import { Hono } from "hono";
import { generateSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { assert, expect } from "vitest";
import { COOKIE_NAME } from "../../constants/cookie";
import { JWT_ALG } from "../../constants/jwt";
import type { HonoEnv } from "../../factory";
import { CloudflareOAuthExternalRepository } from "../../infrastructure/repository/cloudflare/oauth-external";
import { CloudflareUserRepository } from "../../infrastructure/repository/cloudflare/user";
import { oauthRoute } from "../../routes/oauth";
import { userRoute } from "../../routes/user";
import { wellKnownRoute } from "../../routes/well-known";
import { binaryToBase64Url } from "../../utils/oauth/convert-bin-base64";
import { exportKey, generateKeyPair } from "../../utils/oauth/key";

export const AUTHORIZATION_ENDPOINT = "/oauth/authorize";
export const TOKEN_ENDPOINT = "/oauth/access-token";

const JWT_EXPIRATION = 300;
export const DEFAULT_REDIRECT_URI = "https://idp.test/oauth/callback";
const TEST_SECRET = "test-secret";

export const generateCodeChallenge = async (codeVerifier: string) => {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(codeVerifier),
	);
	return binaryToBase64Url(new Uint8Array(hash));
};

export const getClientAuthHeader = (clientId: string, clientSecret: string) =>
	`Basic ${btoa(`${clientId}:${clientSecret}`)}`;

export const createOAuthTestContext = async () => {
	const app = new Hono<HonoEnv>();
	const oauthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
	const userRepository = new CloudflareUserRepository(env.DB);
	const { privateKey } = await generateKeyPair();
	const testPrivateKey = await exportKey(privateKey);

	const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
		c.env = {
			...env,
			SECRET: TEST_SECRET,
			PRIVKEY_FOR_OAUTH: testPrivateKey,
		};
		c.set("OAuthExternalRepository", oauthExternalRepository);
		c.set("UserRepository", userRepository);
		await next();
	});

	app
		.use(repositoryInjector)
		.route("/oauth", oauthRoute)
		.route("/user", userRoute)
		.route("/.well-known", wellKnownRoute);

	const setup = async (scopes?: ScopeId[], callbackUrls?: string[]) => {
		// ユーザー作成
		// ユーザーが存在しないと OAuth App を登録できない
		const userId = await userRepository.createUser({});
		// ユーザーが初期化されていないと OAuth 認可に進めないので初期化
		await userRepository.registerUser(userId, {});

		// Cookie 生成
		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign(
			{
				userId,
				iat: now,
				exp: now + JWT_EXPIRATION,
			},
			TEST_SECRET,
			JWT_ALG,
		);
		// "key=value; Path=/; ..." になっているので key=value だけ取り出す
		const cookie = (
			await generateSignedCookie(COOKIE_NAME.LOGIN_STATE, jwt, TEST_SECRET)
		).split(";")[0];

		// OAuth Client 登録
		const clientId = crypto.randomUUID();
		await oauthExternalRepository.registerClient(
			clientId,
			userId,
			"Dummy App",
			"Dummy App Description",
			scopes ?? [SCOPE_IDS.READ_BASIC_INFO],
			callbackUrls ?? [DEFAULT_REDIRECT_URI],
			null,
		);

		return { userId, cookie, clientId };
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
		inputs.authorized = "1";
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
	const doAuthFlow = async (scopes?: ScopeId[], redirectUris?: string[]) => {
		const { userId, cookie, clientId } = await setup(scopes, redirectUris);
		const params = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
		});
		const res = await app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: cookie } },
		);

		expect(res.status).toBe(200);
		const callbackUrl = await authorize(await res.text(), cookie);
		const code = callbackUrl.searchParams.get("code");
		assert.isNotNull(code);

		return { userId, clientId, code };
	};

	const doAuthFlowWithParams = async (params: URLSearchParams) => {
		const { userId, cookie, clientId } = await setup();
		params.set("response_type", params.get("response_type") ?? "code");
		params.set("client_id", clientId);
		const res = await app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: cookie } },
		);

		expect(res.status).toBe(200);
		const callbackUrl = await authorize(await res.text(), cookie);
		const code = callbackUrl.searchParams.get("code");
		assert.isNotNull(code);

		return { userId, clientId, code };
	};

	return {
		app,
		oauthExternalRepository,
		setup,
		authorize,
		doAuthFlow,
		doAuthFlowWithParams,
	};
};
