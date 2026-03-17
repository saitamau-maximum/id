import type { OAuthProviderId } from "@idp/server/shared/oauth";

export type OAuthConnection = {
	providerId: OAuthProviderId;
	providerUserId: string;
	name: string | null;
	profileImageUrl: string | null;
};
