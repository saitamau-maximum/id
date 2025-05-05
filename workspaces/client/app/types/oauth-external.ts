export interface OAuthClient {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	ownerId: string;
}

export type OAuthScope = {
	id: number;
	name: string;
	description: string | null;
};

export type OAuthClientSecret = {
	secret: string;
	secretHash: string;
	description: string | null;
	issuedBy: string;
	issuedAt: string;
};

export type OAuthClientCallback = {
	clientId: OAuthClient["id"];
	callbackUrl: string;
};
