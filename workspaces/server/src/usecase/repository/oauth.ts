import type { User } from "./user";

export type Client = {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	ownerId: string;
};

export type ClientSecret = {
	clientId: Client["id"];
	secret: string;
	description: string | null;
	issuedBy: User["id"];
	issuedAt: string;
};

export type ClientCallback = {
	clientId: Client["id"];
	callbackUrl: string;
};

export type Scope = {
	id: number;
	name: string;
	description: string | null;
};

export type ClientScope = {
	clientId: Client["id"];
	scopeId: Scope["id"];
};

export type Token = {
	id: number;
	clientId: Client["id"];
	userId: User["id"];
	code: string;
	codeExpiresAt: number;
	codeUsed: boolean;
	redirectUri: string | null;
	accessToken: string;
	accessTokenExpiresAt: number;
};

export type OauthProvider = {
	id: number;
	name: string;
};

export type OauthConnection = {
	userId: User["id"];
	providerId: number;
	providerUserId: string;
	email: string | null;
	name: string | null;
	profileImageUrl: string | null;
};

type GetClientByIdRes = Client & {
	callbackUrls: ClientCallback["callbackUrl"][];
	scopes: Scope[];
};

type CreateAccessTokenSuccessRes = {
	success: true;
};
type CreateAccessTokenErrorRes = {
	success: false;
	message: string;
};

export type IOauthRepository = {
	getClientById: (clientId: string) => Promise<GetClientByIdRes | undefined>;
	createAccessToken: (
		clientId: string,
		userId: string,
		code: string,
		redirectUri: string | undefined,
		accessToken: string,
		scopes: Scope[],
	) => Promise<CreateAccessTokenSuccessRes | CreateAccessTokenErrorRes>;
};
