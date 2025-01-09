const keypairGenAlgorithm = {
	name: "ECDSA",
	namedCurve: "P-521",
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
	publicKey.key_ops = ["verify"];
	return importKey(btoa(JSON.stringify(publicKey)), "publicKey");
};

export { derivePublicKey, importKey };
