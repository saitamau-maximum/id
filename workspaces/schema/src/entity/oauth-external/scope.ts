import * as v from "valibot";

export const SCOPE_IDS = {
	READ_BASIC_INFO: 1,

	// OpenID 系
	OPENID: 1000,
	PROFILE: 1001,
	EMAIL: 1002,
	// 必要情報を持っていないので実装しないが、一応予約済みとしてコメントアウト
	// ADDRESS: 1003,
	// PHONE: 1004,
} as const;

// もしSCOPE_IDSの値が重複していた場合、サーバーを起動する前にエラーを出す
const SCOPE_ID_VALUES = Object.values(SCOPE_IDS);
if (new Set(SCOPE_ID_VALUES).size !== SCOPE_ID_VALUES.length) {
	throw new Error("Scope IDは重複してはいけません");
}

export const ScopeId = v.union(
	SCOPE_ID_VALUES.map((scopeId) => v.literal(scopeId)),
);
export type ScopeId = v.InferOutput<typeof ScopeId>;

export const Scope = v.object({
	id: ScopeId,
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
});
export type Scope = v.InferOutput<typeof Scope>;

export const SCOPES_BY_ID = {
	[SCOPE_IDS.READ_BASIC_INFO]: {
		id: SCOPE_IDS.READ_BASIC_INFO,
		name: "read:basic_info",
		description:
			"あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。",
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
} satisfies Record<ScopeId, Scope>;
