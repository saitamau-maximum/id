import { env } from "cloudflare:test";
import type { Hono } from "hono";
import { generateSignedCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { assert, expect } from "vitest";
import { COOKIE_NAME } from "../../constants/cookie";
import { SCOPE_IDS, type ScopeId } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import type { IOAuthExternalRepository } from "../../repository/oauth-external";
import type { IUserRepository } from "../../repository/user";

const AUTHORIZATION_ENDPOINT = "/oauth/authorize";
const TOKEN_ENDPOINT = "/oauth/access-token";
const JWT_EXPIRATION = 300; // 5 minutes for test
const DEFAULT_REDIRECT_URI = "https://idp.test/oauth/callback";

export const generateUserId = async (userRepository: IUserRepository) => {
	// ユーザーが存在しないと OAuth App を登録できないのでユーザー作成
	const dummyUserId = await userRepository.createUser({});
	// ユーザーが初期化されていないと OAuth 認可に進めないので初期化
	await userRepository.registerUser(dummyUserId, {});
	return dummyUserId;
};

export const getUserSessionCookie = async (userId: string) => {
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

export const getClientAuthHeader = (clientId: string, clientSecret: string) => {
	return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
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

/**
 * Authorization Code Grant の code 取得までを実行する
 * 1. ユーザー作成 / OAuth App 登録
 * 2. Authorization Endpoint にリクエストし、認可する
 * 3. Redirect URI に返ってくる
 */
export const doAuthFlow = async (
	app: Hono<HonoEnv>,
	userRepository: IUserRepository,
	oauthExternalRepository: IOAuthExternalRepository,
) => {
	const dummyUserId = await generateUserId(userRepository);
	const validUserCookie = await getUserSessionCookie(dummyUserId);
	const oauthClientId = await registerOAuthClient(
		oauthExternalRepository,
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
	const callbackUrl = await authorize(app, resText, validUserCookie);
	const code = callbackUrl.searchParams.get("code");
	assert.isNotNull(code);

	return {
		dummyUserId,
		oauthClientId,
		code,
	};
};

export const doAccessTokenRequest = async (
	app: Hono<HonoEnv>,
	userRepository: IUserRepository,
	oauthExternalRepository: IOAuthExternalRepository,
) => {
	const { dummyUserId, oauthClientId, code } = await doAuthFlow(
		app,
		userRepository,
		oauthExternalRepository,
	);
	const oauthClientSecret = await oauthExternalRepository.generateClientSecret(
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
