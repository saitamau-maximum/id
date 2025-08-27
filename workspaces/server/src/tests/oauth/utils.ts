import { env } from "cloudflare:test";
import type { Hono } from "hono";
import { generateSignedCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { assert, expect } from "vitest";
import { COOKIE_NAME } from "../../constants/cookie";
import type { ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import type { IOAuthExternalRepository } from "../../repository/oauth-external";
import type { IUserRepository } from "../../repository/user";

export const AUTHORIZATION_ENDPOINT = "/oauth/authorize";
export const TOKEN_ENDPOINT = "/oauth/access-token";
export const JWT_EXPIRATION = 300; // 5 minutes for test
export const DEFAULT_REDIRECT_URI = "https://idp.test/oauth/callback";

export const registerOAuthClient = async (
	oauthExternalRepository: IOAuthExternalRepository,
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

export const oauthTestsCommonSetup = async (
	oauthExternalRepository: IOAuthExternalRepository,
	userRepository: IUserRepository,
	scopes: ScopeId[],
	callbackUrls: string[],
) => {
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
		env.SECRET,
	);
	// "key=value; Path=/; ..." になっているので key=value だけ取り出す
	const cookie = (
		await generateSignedCookie(COOKIE_NAME.LOGIN_STATE, jwt, env.SECRET)
	).split(";")[0];

	// OAuth Client 登録
	const clientId = await registerOAuthClient(
		oauthExternalRepository,
		userId,
		scopes,
		callbackUrls,
	);

	return { userId, cookie, clientId };
};

/**
 * 認可画面で「承認する」を押してリダイレクトされるまでの処理を模擬する
 * @param html - Authorization Endpoint のレスポンス HTML
 * @returns リダイレクト先 URL (redirect_uri)
 */
export const authorize = async (
	app: Hono<HonoEnv>,
	html: string,
	cookie: string,
): Promise<URL> => {
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
