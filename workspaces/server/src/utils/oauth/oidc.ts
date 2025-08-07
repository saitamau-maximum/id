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

const generateAtHash = async (accessToken: string) => {
	// at_hash は access_token のハッシュ値の左半分を Base64url エンコードしたもの
	// ハッシュアルゴリズムは signJWT と同じ = SHA-512
	const hash = await crypto.subtle.digest(
		{ name: "SHA-512" },
		new TextEncoder().encode(accessToken),
	);
	const leftHalf = new Uint8Array(hash.slice(0, 32)); // SHA-512 は 64B なので左半分は 32B
	return binaryToBase64Url(leftHalf);
};

export const generateIdToken = async ({
	clientId,
	exp,
	authTime,
	nonce,
	accessToken,
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
		at_hash: await generateAtHash(accessToken),
	};
	if (nonce) payload.nonce = nonce;
	if (authTime) payload.auth_time = authTime;

	const idToken = await signJWT(payload, key);

	return idToken;
};
