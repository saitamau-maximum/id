import { describe, expect, it } from "vitest";
import { SCOPE_IDS } from "./scope";

describe("Scope IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(SCOPE_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
