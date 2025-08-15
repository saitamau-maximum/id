import { binaryToBase64Url } from "./convert-bin-base64";

type JsonWebKeyWithKid = JsonWebKey & { kid?: string };

const keypairGenAlgorithm = {
	name: "ECDSA",
	namedCurve: "P-521",
};

const signatureAlgorithm = {
	name: "ECDSA",
	hash: "SHA-512",
};

const keypairUsage = ["sign", "verify"];

const generateKeyPair = async () => {
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

const exportKey = async (key: JsonWebKeyWithKid) => {
	return btoa(JSON.stringify(key));
};

const importKey = async (data: string, type: "publicKey" | "privateKey") => {
	const keyData = JSON.parse(atob(data));
	return crypto.subtle.importKey(
		"jwk",
		keyData,
		keypairGenAlgorithm,
		true,
		type === "publicKey" ? ["verify"] : ["sign"],
	);
};

const derivePublicKey = async (privateKey: CryptoKey) => {
	const publicKey = (await crypto.subtle.exportKey(
		"jwk",
		privateKey,
	)) as JsonWebKey;
	// biome-ignore lint/performance/noDelete: <explanation>
	delete publicKey.d;
	publicKey.use = "sig";
	publicKey.key_ops = ["verify"];
	return importKey(btoa(JSON.stringify(publicKey)), "publicKey");
};

const sign = async (payload: Uint8Array, key: CryptoKey) => {
	const signedBuf = await crypto.subtle.sign(signatureAlgorithm, key, payload);
	return new Uint8Array(signedBuf);
};

const verify = async (
	payload: Uint8Array,
	key: CryptoKey,
	signature: Uint8Array,
) => {
	return crypto.subtle.verify(signatureAlgorithm, key, signature, payload);
};

export { derivePublicKey, importKey, exportKey, generateKeyPair, sign, verify };
