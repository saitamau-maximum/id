import { describe, expect, it } from "vitest";
import { SCOPE_IDS, SCOPES_BY_ID } from "./scope";

describe("Scope IDs", () => {
	it("should be unique", () => {
		const idValues = Object.values(SCOPE_IDS);
		const idSet = new Set(idValues);
		expect(idSet.size).toBe(idValues.length);
	});
});

describe("Scope names", () => {
	it("should be unique", () => {
		const scopeStringValues = Object.values(SCOPES_BY_ID).map(
			(scope) => scope.name,
		);
		const stringValueSet = new Set(scopeStringValues);
		expect(stringValueSet.size).toBe(scopeStringValues.length);
	});

	it("should match RFC6749 scope syntax", () => {
		const scopeStringValues = Object.values(SCOPES_BY_ID).map(
			(scope) => scope.name,
		);
		// https://datatracker.ietf.org/doc/html/rfc6749#appendix-A.4
		const scopeSyntaxRegex = /^[\x21\x23-\x5B\x5D-\x7E]+$/;
		for (const scopeName of scopeStringValues) {
			expect(scopeName).toMatch(scopeSyntaxRegex);
		}
	});
});
