export const OAUTH_SCOPE_REGEX =
	/^[\x21|\x23-\x5B|\x5D-\x7E]+(?:\x20+[\x21|\x23-\x5B|\x5D-\x7E]+)*$/u;

export const OAUTH_PROVIDER_IDS = {
	GITHUB: 1,
	DISCORD: 2,
} as const;

export type OAuthProviderId =
	(typeof OAUTH_PROVIDER_IDS)[keyof typeof OAUTH_PROVIDER_IDS];

export const isValidOAuthProviderId = (id: number): id is OAuthProviderId => {
	// biome-ignore lint/suspicious/noExplicitAny: この関数は外部からの入力を受け取るため、型安全性よりも柔軟性を優先する
	return Object.values(OAUTH_PROVIDER_IDS).includes(id as any);
};

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
		required: false,
		loginPath: "/auth/login/discord",
	},
} as Record<OAuthProviderId, OAuthProviderInfo>;

export const REQUIRED_OAUTH_PROVIDER_IDS = Object.entries(OAUTH_PROVIDERS)
	.filter(([, provider]) => provider.required)
	.map(([id]) => Number(id))
	.filter(isValidOAuthProviderId); // 型ガードを通して型安全性を確保
