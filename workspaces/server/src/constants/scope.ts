export const SCOPE_IDS = {
	READ_BASIC_INFO: 1,
} as const;

export const SCOPE_ID_VALUES = Object.values(SCOPE_IDS);

export type ScopeId = (typeof SCOPE_IDS)[keyof typeof SCOPE_IDS];

export type Scope = {
	id: ScopeId;
	name: string;
	description: string;
};

export const SCOPES_BY_ID: Record<ScopeId, Scope> = {
	[SCOPE_IDS.READ_BASIC_INFO]: {
		id: SCOPE_IDS.READ_BASIC_INFO,
		name: "read:basic_info",
		description:
			"あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。",
	},
};

export const isScopeId = (id: unknown): id is ScopeId => {
	return typeof id === "number" && SCOPE_ID_VALUES.includes(id as ScopeId);
};

export const getScopeById = (id: number) => {
	if (!isScopeId(id)) {
		throw new Error(`Invalid scope ID: ${id}`);
	}
	return SCOPES_BY_ID[id];
};
