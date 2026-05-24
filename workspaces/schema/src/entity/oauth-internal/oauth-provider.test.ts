import { describe, expect, it } from "vitest";
import { OAUTH_PROVIDER_IDS } from "./oauth-provider";

describe("Scope IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(OAUTH_PROVIDER_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
