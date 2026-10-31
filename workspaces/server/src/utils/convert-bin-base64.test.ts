import { describe, expect, it } from "vitest";
import {
	base64ToBinary,
	binaryToBase64,
	binaryToBase64Url,
} from "./convert-bin-base64";

describe("Binary-Base64 Utils", () => {
	it("should convert binary to base64", () => {
		const originalString = "Hello, World!";
		const base64String = binaryToBase64(
			new TextEncoder().encode(originalString),
		);
		expect(base64String).toBe("SGVsbG8sIFdvcmxkIQ==");

		// +, / を含む例
		const specialBinaryData = new Uint8Array([0xfb, 0xff]);
		const specialBase64String = binaryToBase64(specialBinaryData);
		expect(specialBase64String).toBe("+/8=");
	});

	it("should convert base64 to binary", () => {
		const base64String = "SGVsbG8sIFdvcmxkIQ==";
		const binaryData = base64ToBinary(base64String);
		const decodedString = new TextDecoder().decode(binaryData);
		expect(decodedString).toBe("Hello, World!");
	});

	it("should convert binary to base64url", () => {
		const originalString = "Hello, World!";
		const base64UrlString = binaryToBase64Url(
			new TextEncoder().encode(originalString),
		);
		expect(base64UrlString).toBe("SGVsbG8sIFdvcmxkIQ");

		// +, / を含む例
		const specialBinaryData = new Uint8Array([0xfb, 0xff]);
		const specialBase64UrlString = binaryToBase64Url(specialBinaryData);
		expect(specialBase64UrlString).toBe("-_8");
	});
});
