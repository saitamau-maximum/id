import { describe, expect, it } from "vitest";
import { GRADE_IDS } from "./grade";

describe("Grade IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(GRADE_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
