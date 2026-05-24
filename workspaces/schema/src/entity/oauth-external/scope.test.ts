import { describe, expect, it } from "vitest";
import { SCOPE_IDS } from "./scope";

describe("Scope IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(SCOPE_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
