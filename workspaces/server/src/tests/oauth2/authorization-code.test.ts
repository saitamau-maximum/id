import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOAuthTestContext } from "./common";

describe("Authorization code persistence", () => {
	let ctx: Awaited<ReturnType<typeof createOAuthTestContext>>;

	beforeEach(async () => {
		vi.useFakeTimers();
		ctx = await createOAuthTestContext();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("atomically consumes an authorization code only once", async () => {
		const { code } = await ctx.doAuthFlow();

		await expect(ctx.oauthExternalRepository.consumeCode(code)).resolves.toBe(
			true,
		);
		await expect(ctx.oauthExternalRepository.consumeCode(code)).resolves.toBe(
			false,
		);
	});
});
