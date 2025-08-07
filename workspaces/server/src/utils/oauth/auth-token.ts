// auth token を生成するための util
// https://github.com/saitamau-maximum/auth/issues/27

import { base64ToBinary, binaryToBase64 } from "./convert-bin-base64";

interface Param {
	clientId: string;
	redirectUri?: string;
	state?: string;
	scope?: string;
	time: number;
	oidcNonce?: string;
	oidcAuthTime?: number;
}

interface GenerateParam extends Param {
	key: CryptoKey;
}

interface ValidateParam extends Param {
	key: CryptoKey;
	hash: string;
}

const content = (param: Param) => {
	const p = new URLSearchParams();
	p.append("client_id", param.clientId);
	if (param.redirectUri) p.append("redirect_uri", param.redirectUri);
	if (param.state) p.append("state", param.state);
	if (param.scope) p.append("scope", param.scope);
	if (param.oidcNonce) p.append("oidc_nonce", param.oidcNonce);
	p.append("time", param.time.toString());
	return new TextEncoder().encode(p.toString());
};

const ALG = {
	name: "ECDSA",
	hash: "SHA-512",
};

export const generateAuthToken = async (param: GenerateParam) => {
	const { key, ...rest } = param;
	const signedBuf = await crypto.subtle.sign(ALG, key, content(rest));
	return binaryToBase64(new Uint8Array(signedBuf));
};

export const validateAuthToken = (param: ValidateParam) => {
	const { key, hash, ...rest } = param;
	const signBuf = base64ToBinary(hash);
	return crypto.subtle.verify(ALG, key, signBuf, content(rest));
};
