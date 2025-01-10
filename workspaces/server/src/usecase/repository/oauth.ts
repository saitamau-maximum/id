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
	issuedBy: string;
	issuedAt: Date;
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
	userId: string;
	code: string;
	codeExpiresAt: Date;
	codeUsed: boolean;
	redirectUri: string | null;
	accessToken: string;
	accessTokenExpiresAt: Date;
};

export type OAuthProvider = {
	id: number;
	name: string;
};

export type OAuthConnection = {
	userId: string;
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

type GetTokenByCodeRes = Token & {
	client: Client & { secrets: ClientSecret[] };
	scopes: Scope[];
};

type GetTokenByATRes = Token & {
	client: Client;
	scopes: Scope[];
};

export type IOAuthRepository = {
	getClientById: (clientId: string) => Promise<GetClientByIdRes | undefined>;
	createAccessToken: (
		clientId: string,
		userId: string,
		code: string,
		redirectUri: string | undefined,
		accessToken: string,
		scopes: Scope[],
	) => Promise<void>;
	getTokenByCode: (code: string) => Promise<GetTokenByCodeRes | undefined>;
	deleteTokenById: (tokenId: number) => Promise<void>;
	setCodeUsed: (code: string) => Promise<void>;
	getTokenByAccessToken: (
		accessToken: string,
	) => Promise<GetTokenByATRes | undefined>;
};
