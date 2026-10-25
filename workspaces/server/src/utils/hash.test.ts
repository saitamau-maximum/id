import { describe, expect, it } from "vitest";
import { digestToHex, sha256, sha512 } from "./hash";

describe("Hash Utils", () => {
	it("should correctly compute SHA-256 hash", async () => {
		const data = "Hello, World!";
		const hash = await sha256(new TextEncoder().encode(data));
		expect(hash).toBeInstanceOf(Uint8Array);
		expect(hash.length).toBe(32);
		expect(digestToHex(hash)).toMatch(/^[a-f0-9]{64}$/);
		expect(digestToHex(hash)).toBe(
			"dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
		);
	});

	it("should correctly compute SHA-512 hash", async () => {
		const data = "Hello, World!";
		const hash = await sha512(new TextEncoder().encode(data));
		expect(hash).toBeInstanceOf(Uint8Array);
		expect(hash.length).toBe(64);
		expect(digestToHex(hash)).toMatch(/^[a-f0-9]{128}$/);
		expect(digestToHex(hash)).toBe(
			"374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387",
		);
	});
});
