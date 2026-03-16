export const OAUTH_SCOPE_REGEX =
	/^[\x21|\x23-\x5B|\x5D-\x7E]+(?:\x20+[\x21|\x23-\x5B|\x5D-\x7E]+)*$/u;

export const OAUTH_PROVIDER_IDS = {
	GITHUB: 1,
	DISCORD: 2,
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
} as Record<
	(typeof OAUTH_PROVIDER_IDS)[keyof typeof OAUTH_PROVIDER_IDS],
	OAuthProviderInfo
>;
