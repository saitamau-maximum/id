import { describe, expect, it } from "vitest";
import { DEPARTMENT_IDS } from "./department";

describe("Department IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(DEPARTMENT_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
