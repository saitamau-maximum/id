export const SCOPE_IDS = {
	READ_BASIC_INFO: 1,
} as const;

export type ScopeId = (typeof SCOPE_IDS)[keyof typeof SCOPE_IDS];

export type Scope = {
	id: ScopeId;
	name: string;
	description: string;
};

export const OAUTH_SCOPES: Record<ScopeId, OAuthScope> = {
	[SCOPE_IDS.READ_BASIC_INFO]: {
		id: SCOPE_IDS.READ_BASIC_INFO,
		name: "read:basic_info",
		description:
			"あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。",
	},
};
