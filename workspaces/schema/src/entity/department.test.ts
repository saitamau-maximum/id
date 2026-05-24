import { describe, expect, it } from "vitest";
import { DEPARTMENT_IDS } from "./department";

describe("Department IDs", () => {
	it("should be unique", () => {
		const id_values = Object.values(DEPARTMENT_IDS);
		const id_set = new Set(id_values);
		expect(id_set.size).toBe(id_values.length);
	});
});
