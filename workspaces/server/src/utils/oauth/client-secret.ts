export const generateClientSecretHash = async (secret: string) => {
	const hashBuffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(secret),
	);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};

export const maskClientSecret = (secret: string) => `******${secret.slice(-6)}`;
