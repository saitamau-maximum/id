import { SCOPES_BY_ID } from "@idp/schema/entity/oauth-external/scope";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOAuthTestContext } from "./common";

describe("Authorization Server Metadata", () => {
	let ctx: Awaited<ReturnType<typeof createOAuthTestContext>>;

	beforeEach(async () => {
		vi.useFakeTimers();
		ctx = await createOAuthTestContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("advertises implemented token auth methods and PKCE methods", async () => {
		const res = await ctx.app.request(
			"/.well-known/oauth-authorization-server",
		);
		expect(res.status).toBe(200);
		const json = await res.json<{
			issuer: string;
			authorization_endpoint: string;
			token_endpoint: string;
			scopes_supported: string[];
			response_types_supported: string[];
			token_endpoint_auth_methods_supported: string[];
			code_challenge_methods_supported: string[];
		}>();
		const issuer = new URL(json.issuer);
		expect(issuer.protocol).toBe("https:");
		expect(issuer.search).toBe("");
		expect(issuer.hash).toBe("");
		expect(json.authorization_endpoint).toBeTypeOf("string");
		expect(json.token_endpoint).toBeTypeOf("string");
		expect(json.scopes_supported).toEqual(
			Object.values(SCOPES_BY_ID).map((scope) => scope.name),
		);
		expect(json.response_types_supported.length).toBeGreaterThan(0);
		expect(json.response_types_supported).toContain("token id_token");
		expect(json.token_endpoint_auth_methods_supported).toContain(
			"client_secret_basic",
		);
		expect(json.token_endpoint_auth_methods_supported).toContain(
			"client_secret_post",
		);
		expect(json.code_challenge_methods_supported).toContain("plain");
		expect(json.code_challenge_methods_supported).toContain("S256");
	});

	it("serves OAuth authorization server metadata without OIDC-only fields", async () => {
		const res = await ctx.app.request(
			"/.well-known/oauth-authorization-server",
		);
		expect(res.status).toBe(200);
		const json = await res.json<Record<string, unknown>>();
		expect(json).toHaveProperty("authorization_endpoint");
		expect(json).toHaveProperty("code_challenge_methods_supported");
		expect(json).not.toHaveProperty("userinfo_endpoint");
		expect(json).not.toHaveProperty("claims_supported");
		expect(json).not.toHaveProperty("id_token_signing_alg_values_supported");
	});
});
