import type {
	Client,
	ClientCallback,
	ClientSecret,
	ClientToken,
} from "@idp/schema/entity/oauth-external/client";
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
		oidcNonce?: string,
		oidcAuthTime?: number,
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
