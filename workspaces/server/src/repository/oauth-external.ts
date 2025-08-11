import type { Scope, ScopeId } from "../constants/scope";
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
	issuedBy: string;
	issuedAt: Date;
};

export type ClientCallback = {
	clientId: Client["id"];
	callbackUrl: string;
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

type UserBasicInfo = Pick<
	User,
	"id" | "displayId" | "displayName" | "profileImageURL" | "roles"
>;

type GetClientsRes = Client & {
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
};

type GetClientByIdRes = Client & {
	callbackUrls: ClientCallback["callbackUrl"][];
	secrets: ClientSecret[];
	scopes: Scope[];
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
};

type GetTokenByCodeRes = Token & {
	client: Client & { secrets: ClientSecret[] };
	scopes: Scope[];
};

type GetTokenByATRes = Token & {
	client: Client;
	scopes: Scope[];
	user: UserBasicInfo;
};

export type IOAuthExternalRepository = {
	// common
	getClientById: (clientId: string) => Promise<GetClientByIdRes | undefined>;

	// management
	getClients: () => Promise<GetClientsRes[]>;
	updateManagers: (clientId: string, userIds: string[]) => Promise<void>;
	generateClientSecret: (clientId: string, userId: string) => Promise<string>;
	updateClientSecretDescription: (
		clientId: string,
		secret: string,
		description: string,
	) => Promise<void>;
	deleteClientSecret: (clientId: string, secret: string) => Promise<void>;
	registerClient: (
		clientId: string,
		userId: string,
		name: string,
		description: string,
		scopeIds: ScopeId[],
		callbackUrls: string[],
		logoUrl: string | null,
	) => Promise<void>;
	updateClient: (
		clientId: string,
		name: string,
		description: string,
		scopeIds: ScopeId[],
		callbackUrls: string[],
		logoUrl: string | null,
	) => Promise<void>;
	deleteClient: (clientId: string) => Promise<void>;

	// OAuth flow
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

	// cron
	deleteExpiredAccessTokens: () => Promise<void>;
};
