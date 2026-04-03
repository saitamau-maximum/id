import * as v from "valibot";

export const OAUTH_PROVIDER_IDS = {
	GITHUB: 1,
	DISCORD: 2,
} as const;

// もし OAUTH_PROVIDER_IDS の値が重複していた場合、サーバーを起動する前にエラーを出す
const OAUTH_PROVIDER_IDS_VALUES = Object.values(OAUTH_PROVIDER_IDS);
if (
	new Set(OAUTH_PROVIDER_IDS_VALUES).size !== OAUTH_PROVIDER_IDS_VALUES.length
) {
	throw new Error("OAuth Provider ID は重複してはいけません");
}

export const OAuthProviderId = v.union(
	OAUTH_PROVIDER_IDS_VALUES.map((id) => v.literal(id)),
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
