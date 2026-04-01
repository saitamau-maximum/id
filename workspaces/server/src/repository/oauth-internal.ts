import type { OAuthProviderId } from "@idp/schema/entity/oauth-provider";

export type OAuthConnection = {
	userId: string;
	providerId: OAuthProviderId;
	providerUserId: string;
	refreshToken: string | null;
	refreshTokenExpiresAt: Date | null;
	email: string | null;
	name: string | null;
	profileImageUrl: string | null;
};

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
