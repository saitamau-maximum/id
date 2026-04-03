import type { OAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";

export type IOAuthInternalRepository = {
	fetchUserIdByProviderInfo: (
		providerUserId: string,
		providerId: OAuthProviderId,
	) => Promise<string>;
	fetchOAuthConnectionsByUserId: (userId: string) => Promise<OAuthConnection[]>;
	fetchOAuthConnectionsByUserDisplayId: (
		displayId: string,
	) => Promise<OAuthConnection[]>;
	createOAuthConnection: (data: OAuthConnection) => Promise<void>;
	updateOAuthConnection: (data: OAuthConnection) => Promise<void>;
	deleteOAuthConnection: (
		userId: string,
		providerId: OAuthProviderId,
	) => Promise<void>;
	fetchAccessTokenByUserId: (
		userId: string,
		providerId: OAuthProviderId,
	) => Promise<string | null>;
};
