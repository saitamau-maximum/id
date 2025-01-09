const keypairGenAlgorithm = {
	name: "ECDSA",
	namedCurve: "P-521",
};
const keypairUsage = ["sign", "verify"];
const keypairProtectedHeader = {
	alg: "ES512",
};

const symmetricGenAlgorithm = {
	name: "AES-GCM",
	length: 256,
};
const symmetricUsage = ["encrypt", "decrypt"];
const symmetricProtectedHeader = {
	alg: "dir",
	enc: "A256GCM",
};

const generateKeyPair = () =>
	crypto.subtle.generateKey(
		keypairGenAlgorithm,
		true,
		keypairUsage,
	) as Promise<CryptoKeyPair>;

const generateSymmetricKey = () =>
	crypto.subtle.generateKey(
		symmetricGenAlgorithm,
		true,
		symmetricUsage,
	) as Promise<CryptoKey>;

const exportKey = async (key: CryptoKey) => {
	const exportedKey = (await crypto.subtle.exportKey("jwk", key)) as JsonWebKey;
	return btoa(JSON.stringify(exportedKey));
};

const importKey = async (
	data: string,
	type: "publicKey" | "privateKey" | "symmetric",
) => {
	const keyData = JSON.parse(atob(data));
	if (type === "symmetric") {
		return crypto.subtle.importKey(
			"jwk",
			keyData,
			symmetricGenAlgorithm,
			true,
			symmetricUsage,
		);
	}
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
	publicKey.key_ops = ["verify"];
	return importKey(btoa(JSON.stringify(publicKey)), "publicKey");
};

export {
	derivePublicKey,
	exportKey,
	generateKeyPair,
	generateSymmetricKey,
	importKey,
	keypairGenAlgorithm,
	keypairProtectedHeader,
	keypairUsage,
	symmetricGenAlgorithm,
	symmetricProtectedHeader,
	symmetricUsage,
};
