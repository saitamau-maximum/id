export const SCOPE_IDS = {
	// TODO: openid が上位互換になるので、 read:basic_info を消す
	READ_BASIC_INFO: 1,

	// OpenID 系
	OPENID: 1000,
	PROFILE: 1001,
	EMAIL: 1002,
	// 必要情報を持っていないので実装しないが、一応予約済みとしてコメントアウト
	// ADDRESS: 1003,
	// PHONE: 1004,
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
			"[Deprecated] あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。",
	},
	[SCOPE_IDS.OPENID]: {
		id: SCOPE_IDS.OPENID,
		name: "openid",
		description:
			"Maximum IdP で本人確認を行い、 OpenID Connect を通してこのサービスへのサインインを許可します。",
	},
	[SCOPE_IDS.PROFILE]: {
		id: SCOPE_IDS.PROFILE,
		name: "profile",
		description:
			"このサービスがあなたのプロフィール情報 (氏名、プロフィール画像など) を利用することを許可します。",
	},
	[SCOPE_IDS.EMAIL]: {
		id: SCOPE_IDS.EMAIL,
		name: "email",
		description:
			"このサービスが、Maximum IdP に登録されている「連絡の取れるメールアドレス」を取得することを許可します。",
	},
	// [SCOPE_IDS.ADDRESS]: {
	// 	id: SCOPE_IDS.ADDRESS,
	// 	name: "address",
	// 	description:
	// 		"このサービスがあなたの住所を利用することを許可します。 商品の配送先などの入力が簡単になります。",
	// },
	// [SCOPE_IDS.PHONE]: {
	// 	id: SCOPE_IDS.PHONE,
	// 	name: "phone",
	// 	description:
	// 		"このサービスがあなたの電話番号を利用することを許可します。 SMS での本人確認や二要素認証によるセキュリティ強化に利用されます。",
	// },
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
