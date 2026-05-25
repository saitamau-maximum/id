import { describe, expect, it } from "vitest";
import { TOAST_ITEMS, ToastHashFn } from "./toast";

describe("Toast Hash", () => {
	it("should not collide", () => {
		const hashes = TOAST_ITEMS.map(ToastHashFn);
		const uniqueHashes = new Set(hashes);
		expect(uniqueHashes.size).toBe(hashes.length);
	});
});
