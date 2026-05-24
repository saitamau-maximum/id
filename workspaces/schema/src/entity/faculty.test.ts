import { describe, expect, it } from "vitest";
import { FACULTY_IDS } from "./faculty";

describe("Faculty IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(FACULTY_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
