import { binaryToBase64Url } from "./convert-bin-base64";

type JsonWebKeyWithKid = JsonWebKey & { kid: string };

const keypairGenAlgorithm = {
	name: "ECDSA",
	namedCurve: "P-521",
};

const signatureAlgorithm = {
	name: "ECDSA",
	hash: "SHA-512",
};

const keypairUsage = ["sign", "verify"];

export const jwkToKey = (jwk: JsonWebKey, type: "publicKey" | "privateKey") =>
	crypto.subtle.importKey(
		"jwk",
		jwk,
		keypairGenAlgorithm,
		true,
		type === "publicKey" ? ["verify"] : ["sign"],
	);

export const generateKeyPair = async () => {
	const { privateKey, publicKey } = (await crypto.subtle.generateKey(
		keypairGenAlgorithm,
		true,
		keypairUsage,
	)) as CryptoKeyPair;

	const privKeyJwk = (await crypto.subtle.exportKey(
		"jwk",
		privateKey,
	)) as JsonWebKeyWithKid;
	const pubKeyJwk = (await crypto.subtle.exportKey(
		"jwk",
		publicKey,
	)) as JsonWebKeyWithKid;

	// kid を設定
	const kid = binaryToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
	privKeyJwk.kid = kid;
	pubKeyJwk.kid = kid;

	// use を設定 (署名用; 暗号化用にしたい場合は enc にする)
	privKeyJwk.use = "sig";
	pubKeyJwk.use = "sig";

	return {
		privateKey: privKeyJwk,
		publicKey: pubKeyJwk,
	};
};

export const exportKey = async (key: JsonWebKeyWithKid) => {
	return btoa(JSON.stringify(key));
};

export const importKey = async (
	data: string,
	type: "publicKey" | "privateKey",
) => {
	const { kid, ...keyData }: JsonWebKeyWithKid = JSON.parse(atob(data));
	return {
		jwk: {
			...keyData,
			kid,
		},
		key: await jwkToKey(keyData, type),
	};
};

export const derivePublicKey = (
	privateKey: JsonWebKeyWithKid,
): JsonWebKeyWithKid => {
	const publicKey = privateKey;
	// biome-ignore lint/performance/noDelete: d は秘密鍵の情報なので削除、 d = undefined とはしない
	delete publicKey.d;
	return publicKey;
};

export const sign = async (payload: Uint8Array, key: CryptoKey) => {
	const signedBuf = await crypto.subtle.sign(signatureAlgorithm, key, payload);
	return new Uint8Array(signedBuf);
};

export const verify = async (
	payload: Uint8Array,
	key: CryptoKey,
	signature: Uint8Array,
) => {
	return crypto.subtle.verify(signatureAlgorithm, key, signature, payload);
};
