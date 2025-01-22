export type OAuthConnection = {
	userId: string;
	providerId: number;
	providerUserId: string;
	email: string | null;
	name: string | null;
	profileImageUrl: string | null;
};

export type IOAuthInternalRepository = {
	fetchOAuthConnectionsByUserId: (userId: string) => Promise<OAuthConnection[]>;
	fetchOAuthConnectionsByUserDisplayId: (
		displayId: string,
	) => Promise<OAuthConnection[]>;
};
