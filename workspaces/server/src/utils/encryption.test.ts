import { describe, expect, it } from "vitest";
import { decrypt, deriveKey, encrypt } from "./encryption";

describe("Encryption Utils", () => {
	const secret = "my-secret";
	const info = "my-info";
	const derivedKeyType = { name: "AES-GCM", length: 256 };
	const keyUsages = ["encrypt", "decrypt"];

	it("should derive a key using HKDF", async () => {
		const derivedKey = await deriveKey(secret, info, derivedKeyType, keyUsages);
		expect(derivedKey).toBeInstanceOf(CryptoKey);
	});

	it("should encrypt and decrypt data using AES-GCM", async () => {
		const derivedKey = await deriveKey(secret, info, derivedKeyType, keyUsages);

		const data = "Hello, World!";
		const encryptedData = await encrypt(derivedKey, data);
		expect(encryptedData).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);

		const decryptedData = await decrypt(derivedKey, encryptedData);
		expect(decryptedData).toBe(data);
	});

	it("should throw an error if the encrypted data format is invalid", async () => {
		const derivedKey = await deriveKey(secret, info, derivedKeyType, keyUsages);

		const invalidEncryptedData = "invalid-format";
		await expect(decrypt(derivedKey, invalidEncryptedData)).rejects.toThrow();
	});
});
