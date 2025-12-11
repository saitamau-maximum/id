import { iss } from "./constant";
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
	// 必要最低限のフィールドは id_token に含める
	name?: string;
	picture?: string;
	email?: string;
}

interface Param {
	clientId: string;
	userId: string;
	exp: number;
	authTime?: number;
	nonce?: string;
	accessToken: string;
	privateKey: string;
	keyId?: string;
	// 必要最低限のフィールドは id_token に含める
	name?: string;
	picture?: string;
	email?: string;
}

const signJWT = async (
	payload: OidcIdTokenPayload,
	key: CryptoKey,
	keyId: string,
) => {
	const encodedPayload = binaryToBase64Url(
		new TextEncoder().encode(JSON.stringify(payload)),
	);
	const encodedHeader = binaryToBase64Url(
		new TextEncoder().encode(
			JSON.stringify({ alg: "ES512", typ: "JWT", kid: keyId }),
		),
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

export const generateSub = async (clientId: string, userId: string) => {
	// sub は以下の条件を満たす必要がある (pairwise sub としている)
	// - unique
	// - User が同じでも、 Client に対して異なる sub を生成する
	// - OpenID Provider (つまり IdP Server) 以外にとって可逆不可能
	// - 同じ入力に対しては同じ結果
	// そのため、 Client ID と User ID を組み合わせてハッシュをとることにする
	const payload = `${clientId}_${userId}`;
	const hash = await crypto.subtle.digest(
		{ name: "SHA-512" },
		new TextEncoder().encode(payload),
	);
	return binaryToBase64Url(new Uint8Array(hash));
};

export const generateIdToken = async ({
	clientId,
	userId,
	exp,
	authTime,
	nonce,
	accessToken,
	privateKey,
	name,
	picture,
	email,
}: Param) => {
	const {
		key,
		jwk: { kid },
	} = await importKey(privateKey, "privateKey");

	// OpenID Connect の ID Token 生成
	const nowUnixS = Math.floor(Date.now() / 1000);
	const atHash = await generateAtHash(accessToken);

	const payload: OidcIdTokenPayload = {
		iss,
		sub: await generateSub(clientId, userId),
		aud: [clientId],
		exp: exp,
		iat: nowUnixS,
		at_hash: atHash,
	};
	if (nonce) payload.nonce = nonce;
	if (authTime) payload.auth_time = authTime;
	if (name) payload.name = name;
	if (picture) payload.picture = picture;
	if (email) payload.email = email;

	const idToken = await signJWT(payload, key, kid);

	return idToken;
};
