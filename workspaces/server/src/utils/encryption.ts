import { base64ToBinary, binaryToBase64 } from "./convert-bin-base64";

/**
 * HKDF により暗号化・復号のための鍵を導出する
 * @param secret マスターキー。 エントロピーが十分にあるランダムな文字列 (`env.SECRET` など) を使用すること
 * @param info 用途 (使用場所など)。 暗号化・復号の際に同じ値を使用する。
 * @param derivedKeyType 導出する鍵の種類
 * @param keyUsages 導出する鍵の用途
 * @returns 導出された鍵
 * @see https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/deriveKey
 */
export const deriveKey = async (
	secret: string,
	info: string,
	derivedKeyType: string | SubtleCryptoImportKeyAlgorithm,
	keyUsages: string[],
): Promise<CryptoKey> => {
	const enc = new TextEncoder();

	const masterKey = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		"HKDF",
		false,
		["deriveKey"],
	);

	return await crypto.subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-512",
			// salt, info が同じであれば、同じ derivedKey が導出される
			// salt は秘密にする必要はないので適当な文字列 (ref: https://developer.mozilla.org/ja/docs/Web/API/HkdfParams)
			salt: enc.encode("idp-salt-value-for-derive-key"),
			info: enc.encode(info),
		},
		masterKey,
		derivedKeyType,
		false,
		keyUsages,
	);
};

/**
 * AES-GCM により文字列を暗号化する
 * @param key 暗号化に使用する共通鍵
 * @param data 暗号化する文字列
 * @returns 暗号化された文字列 (`iv:encryptedData` の形式)
 */
export const encrypt = async (
	key: CryptoKey,
	data: string,
): Promise<string> => {
	const enc = new TextEncoder();
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const encryptedBuf = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		enc.encode(data),
	);

	const ivBase64 = binaryToBase64(iv);
	const encryptedBase64 = binaryToBase64(new Uint8Array(encryptedBuf));

	return `${ivBase64}:${encryptedBase64}`;
};

/**
 * {@linkcode encrypt} で暗号化された文字列を復号する
 * @param key 復号に使用する共通鍵
 * @param encryptedData {@linkcode encrypt} で暗号化された文字列 (`iv:encryptedData` の形式)
 * @returns 復号された文字列
 * @throws 暗号化された文字列の形式が不正な場合、または復号に失敗した場合
 */
export const decrypt = async (
	key: CryptoKey,
	encryptedData: string,
): Promise<string> => {
	const [ivBase64, encryptedBase64] = encryptedData.split(":");
	if (!ivBase64 || !encryptedBase64) {
		throw new Error("Invalid encrypted data format");
	}

	const iv = base64ToBinary(ivBase64);
	const encryptedBuf = base64ToBinary(encryptedBase64);

	const decryptedBuf = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		encryptedBuf,
	);

	return new TextDecoder().decode(decryptedBuf);
};
