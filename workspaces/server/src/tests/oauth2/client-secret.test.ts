import { env } from "cloudflare:test";
import {
	afterEach,
	assert,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import {
	createOAuthTestContext,
	getClientAuthHeader,
	TOKEN_ENDPOINT,
} from "./common";

describe("OAuth client secrets", () => {
	let ctx: Awaited<ReturnType<typeof createOAuthTestContext>>;

	beforeEach(async () => {
		vi.useFakeTimers();
		ctx = await createOAuthTestContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("stores newly generated client secrets as hashes while preserving token exchange", async () => {
		const { userId, clientId, code } = await ctx.doAuthFlow();
		const oauthClientSecret =
			await ctx.oauthExternalRepository.generateClientSecret(clientId, userId);
		const client = await ctx.oauthExternalRepository.getClientById(clientId);
		assert.isDefined(client);
		const generatedSecret = client.secrets.at(-1);
		assert.isDefined(generatedSecret);
		expect(generatedSecret.secret).toBe(`******${oauthClientSecret.slice(-6)}`);
		expect(generatedSecret.secret).not.toContain(oauthClientSecret.slice(0, 8));
		expect(generatedSecret.secretHash).toMatch(/^[0-9a-f]{64}$/);

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
		expect(tokenRes.status).toBe(200);
	});

	it("accepts legacy plaintext client secrets during migration", async () => {
		const { userId, clientId, code } = await ctx.doAuthFlow();
		const legacySecret = "legacy-client-secret";
		await env.DB.prepare(
			"INSERT INTO oauth_client_secrets (client_id, secret, description, issued_by, issued_at) VALUES (?, ?, ?, ?, ?)",
		)
			.bind(clientId, legacySecret, "", userId, Date.now())
			.run();

		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		const tokenRes = await ctx.app.request(TOKEN_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				Authorization: getClientAuthHeader(clientId, legacySecret),
			},
		});
		expect(tokenRes.status).toBe(200);
	});
});
