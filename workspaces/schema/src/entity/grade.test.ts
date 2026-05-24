import { describe, expect, it } from "vitest";
import { GRADE_IDS } from "./grade";

describe("Grade IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(GRADE_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
