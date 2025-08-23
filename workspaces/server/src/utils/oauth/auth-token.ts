// auth token を生成するための util
// https://github.com/saitamau-maximum/auth/issues/27

import { base64ToBinary, binaryToBase64 } from "./convert-bin-base64";
import { sign, verify } from "./key";

interface Param {
	clientId: string;
	responseType: string;
	redirectUri?: string;
	scope?: string;
	state?: string;
	oidcNonce?: string;
	oidcAuthTime?: number;
	time: number;
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
	p.append("response_type", param.responseType);
	if (param.redirectUri) p.append("redirect_uri", param.redirectUri);
	if (param.scope) p.append("scope", param.scope);
	if (param.state) p.append("state", param.state);
	if (param.oidcNonce) p.append("oidc_nonce", param.oidcNonce);
	if (param.oidcAuthTime)
		p.append("oidc_auth_time", param.oidcAuthTime.toString());
	p.append("time", param.time.toString());
	return new TextEncoder().encode(p.toString());
};

export const generateAuthToken = async (param: GenerateParam) => {
	const { key, ...rest } = param;
	return binaryToBase64(await sign(content(rest), key));
};

export const validateAuthToken = (param: ValidateParam) => {
	const { key, hash, ...rest } = param;
	const signBuf = base64ToBinary(hash);
	return verify(content(rest), key, signBuf);
};
