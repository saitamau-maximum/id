import { describe, expect, it } from "vitest";
import { OAUTH_PROVIDER_IDS } from "./oauth-provider";

describe("OAuth Provider IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(OAUTH_PROVIDER_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
