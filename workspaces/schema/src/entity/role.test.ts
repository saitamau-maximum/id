import { describe, expect, it } from "vitest";
import { ROLE_IDS } from "./role";

describe("Role IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(ROLE_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
