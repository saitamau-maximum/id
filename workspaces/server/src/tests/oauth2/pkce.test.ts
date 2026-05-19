import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	AUTHORIZATION_ENDPOINT,
	createOAuthTestContext,
	generateCodeChallenge,
	getClientAuthHeader,
	TOKEN_ENDPOINT,
} from "./common";

describe("RFC 7636: PKCE", () => {
	let ctx: Awaited<ReturnType<typeof createOAuthTestContext>>;

	beforeEach(async () => {
		vi.useFakeTimers();
		ctx = await createOAuthTestContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("exchanges a code when the S256 code_verifier matches", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const codeChallenge = await generateCodeChallenge(codeVerifier);
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeChallenge,
				code_challenge_method: "S256",
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append("code_verifier", codeVerifier);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(200);
	});

	it("exchanges a code when the plain code_verifier matches", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeVerifier,
				code_challenge_method: "plain",
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append("code_verifier", codeVerifier);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(200);
	});

	it("defaults code_challenge_method to plain when omitted", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeVerifier,
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append("code_verifier", codeVerifier);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(200);
	});

	it("rejects a PKCE-protected code when code_verifier is missing", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const codeChallenge = await generateCodeChallenge(codeVerifier);
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeChallenge,
				code_challenge_method: "S256",
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(401);
		const json = await tokenRes.json<{ error: string }>();
		expect(json.error).toBe("invalid_grant");
	});

	it("rejects a PKCE-protected code when code_verifier does not match", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const codeChallenge = await generateCodeChallenge(codeVerifier);
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeChallenge,
				code_challenge_method: "S256",
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append(
			"code_verifier",
			"wrong56789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN",
		);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(401);
	});

	it("rejects a plain PKCE-protected code when code_verifier does not match", async () => {
		const codeVerifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN";
		const { userId, clientId, code } = await ctx.doAuthFlowWithParams(
			new URLSearchParams({
				code_challenge: codeVerifier,
				code_challenge_method: "plain",
			}),
		);
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append(
			"code_verifier",
			"wrong56789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN",
		);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, oauthClientSecret),
			},
		});
		expect(tokenRes.status).toBe(401);
	});

	it("rejects unsupported code_challenge_method", async () => {
		const { cookie, clientId } = await ctx.setup();
		const params = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
			code_challenge: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN",
			code_challenge_method: "unsupported",
		});
		const res = await ctx.app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: cookie } },
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location") ?? "").contains("error=invalid_request");
	});

	it("rejects code_challenge_method without code_challenge", async () => {
		const { cookie, clientId } = await ctx.setup();
		const params = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
			code_challenge_method: "S256",
		});
		const res = await ctx.app.request(
			`${AUTHORIZATION_ENDPOINT}?${params.toString()}`,
			{ headers: { Cookie: cookie } },
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location") ?? "").contains("error=invalid_request");
	});
});
