import type { OAuthProviderId } from "@idp/schema/entity/oauth-provider";

export type OAuthConnection = {
	providerId: OAuthProviderId;
	providerUserId: string;
	name: string | null;
	profileImageUrl: string | null;
};
