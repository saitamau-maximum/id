import type {
	Client,
	ClientCallback,
	ClientSecret,
	ClientToken,
} from "@idp/schema/entity/oauth-external/client";
import type { PkceCodeChallengeMethod } from "@idp/schema/entity/oauth-external/pkce";
import type { Scope, ScopeId } from "@idp/schema/entity/oauth-external/scope";
import type { Role } from "@idp/schema/entity/role";
import type { User, UserBasicInfo, UserProfile } from "@idp/schema/entity/user";

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

type GetTokenByCodeRes = ClientToken & {
	client: Client & { secrets: ClientSecret[] };
	scopes: Scope[];
	oidcParams: {
		nonce?: string;
		authTime?: number;
	};
};

type GetTokenByATRes = ClientToken & {
	client: Client;
	scopes: Scope[];
	user: Pick<User, "id"> & { profile: Partial<UserProfile>; roles: Role[] };
};

type GetUserGrantedClientRes = {
	client: Pick<Client, "id" | "name" | "description" | "logoUrl">;
	scopes: Scope[];
	updatedAt: Date;
};

export type IOAuthExternalRepository = {
	// common
	getClientById: (clientId: string) => Promise<GetClientByIdRes | undefined>;

	// management
	getClients: () => Promise<GetClientsRes[]>;
	updateManagers: (clientId: string, userIds: string[]) => Promise<void>;
	generateClientSecret: (clientId: string, userId: string) => Promise<string>;
	verifyClientSecret: (clientId: string, secret: string) => Promise<boolean>;
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
		codeChallenge?: string,
		codeChallengeMethod?: PkceCodeChallengeMethod,
		oidcNonce?: string,
		oidcAuthTime?: number,
	) => Promise<void>;
	getTokenByCode: (code: string) => Promise<GetTokenByCodeRes | undefined>;
	deleteTokenById: (tokenId: number) => Promise<void>;
	consumeCode: (code: string) => Promise<boolean>;
	getTokenByAccessToken: (
		accessToken: string,
	) => Promise<GetTokenByATRes | undefined>;
	getGrantedScopes: (userId: string, clientId: string) => Promise<Scope[]>;
	upsertGrantScopes: (
		userId: string,
		clientId: string,
		scopes: Scope[],
	) => Promise<void>;
	getUserGrantedClients: (userId: string) => Promise<GetUserGrantedClientRes[]>;
	revokeClientGrant: (userId: string, clientId: string) => Promise<void>;

	// cron
	deleteExpiredAccessTokens: () => Promise<void>;
};
