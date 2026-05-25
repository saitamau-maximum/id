import * as v from "valibot";

export const OAUTH_PROVIDER_IDS = {
	GITHUB: 1,
	DISCORD: 2,
} as const;

export const OAuthProviderId = v.union(
	Object.values(OAUTH_PROVIDER_IDS).map((id) => v.literal(id)),
);

export type OAuthProviderId = v.InferOutput<typeof OAuthProviderId>;

interface OAuthProviderInfo {
	name: string;
	required: boolean;
	loginPath: string;
}

export const OAUTH_PROVIDERS = {
	[OAUTH_PROVIDER_IDS.GITHUB]: {
		name: "GitHub",
		required: true,
		loginPath: "/auth/login/github",
	},
	[OAUTH_PROVIDER_IDS.DISCORD]: {
		name: "Discord",
		required: true,
		loginPath: "/auth/login/discord",
	},
} satisfies Record<OAuthProviderId, OAuthProviderInfo>;

export const REQUIRED_OAUTH_PROVIDER_IDS = Object.entries(OAUTH_PROVIDERS)
	.filter(([, provider]) => provider.required)
	.map(([id]) => Number(id))
	.filter((id) => v.is(OAuthProviderId, id));
