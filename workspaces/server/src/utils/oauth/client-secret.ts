import { digestToHex, sha256 } from "../hash";

export const generateClientSecretHash = async (secret: string) => {
	const hash = await sha256(new TextEncoder().encode(secret));
	return digestToHex(hash);
};

export const maskClientSecret = (secret: string) => `******${secret.slice(-6)}`;
