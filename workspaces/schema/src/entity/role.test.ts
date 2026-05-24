import { describe, expect, it } from "vitest";
import { ROLE_IDS } from "./role";

describe("Role IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(ROLE_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});
