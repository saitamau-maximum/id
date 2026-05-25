import { describe, expect, it } from "vitest";
import { FACULTY_IDS } from "./faculty";

describe("Faculty IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(FACULTY_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
