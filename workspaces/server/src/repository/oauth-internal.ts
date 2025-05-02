export type OAuthConnection = {
	userId: string;
	providerId: number;
	providerUserId: string;
	email: string | null;
	name: string | null;
	profileImageUrl: string | null;
};

export type IOAuthInternalRepository = {
	fetchUserIdByProviderInfo: (
		providerUserId: string,
		providerId: number,
	) => Promise<string>;
	fetchOAuthConnectionsByUserId: (userId: string) => Promise<OAuthConnection[]>;
	fetchOAuthConnectionsByUserDisplayId: (
		displayId: string,
	) => Promise<OAuthConnection[]>;
	createOAuthConnection: (data: OAuthConnection) => Promise<void>;
	updateOAuthConnection: (data: OAuthConnection) => Promise<void>;
};
