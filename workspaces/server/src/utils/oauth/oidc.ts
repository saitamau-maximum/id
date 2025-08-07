import { binaryToBase64Url } from "./convert-bin-base64";
import { importKey, sign } from "./key";

interface OidcIdTokenPayload {
	iss: string;
	sub: string;
	aud: string[];
	exp: number;
	iat: number;
	auth_time?: number;
	nonce?: string;
	// acr, amr, azp は使わないので省略
	at_hash: string;
}

interface Param {
	clientId: string;
	exp: number;
	authTime?: number;
	nonce?: string;
	accessToken: string;
	privateKey: string;
}

const signJWT = async (payload: OidcIdTokenPayload, key: CryptoKey) => {
	const encodedPayload = binaryToBase64Url(
		new TextEncoder().encode(JSON.stringify(payload)),
	);
	const encodedHeader = binaryToBase64Url(
		new TextEncoder().encode(JSON.stringify({ alg: "ES512", typ: "JWT" })),
	);
	const partial = `${encodedHeader}.${encodedPayload}`;
	const signature = await sign(new TextEncoder().encode(partial), key);
	const encodedSignature = binaryToBase64Url(signature);

	return `${partial}.${encodedSignature}`;
};

export const generateIdToken = async ({
	clientId,
	exp,
	authTime,
	nonce,
	_accessToken,
	privateKey,
}: Param) => {
	const key = await importKey(privateKey, "privateKey");

	// OpenID Connect の ID Token 生成
	const nowUnixS = Math.floor(Date.now() / 1000);

	const payload: OidcIdTokenPayload = {
		iss: "https://api.id.maximum.vc",
		sub: crypto.randomUUID(),
		aud: [clientId],
		exp: exp,
		iat: nowUnixS,
		at_hash: "TODO",
	};
	if (nonce) payload.nonce = nonce;
	if (authTime) payload.auth_time = authTime;

	const idToken = await signJWT(payload, key);

	return idToken;
};
