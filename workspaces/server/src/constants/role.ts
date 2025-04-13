export const JOB_ROLE_IDS = {
	/** 管理者 */
	ADMIN: 1,
	/** 会計 */
	ACCOUNTANT: 2,
	/** 広報 */
	PR: 3,
} as const;

export const STATUS_ROLE_IDS = {
	/**
	 * メンバー (会費を払ってる人という区分)
	 * - 卒業生でも会費を払っている人は含む
	 * - 会費を払わなかった(==辞めた)人はこのロールを外すことでコンテンツアクセスを制限する
	 */
	MEMBER: 101,
	/**
	 * 卒業生 (Bachelor, Master, PhD のいずれかのタイミングで弊学を卒業した人)
	 * - 卒業生でも会費を払うことでコンテンツアクセスを許可したい
	 * - 現役との区別のためのロール
	 */
	ALUMNI: 102,
} as const;

export const TEAM_ROLE_IDS = {
	/** 開発 */
	DEV: 201,
	/** 競技プログラミング */
	CP: 202,
	/** Web */
	WEB: 203,
	/** AI */
	AI: 204,
	/** CTF */
	CTF: 205,
	/** モバイルアプリ */
	MOBILE: 206,
	/** ゲーム開発 */
	GAME: 207,
	/** インフラ */
	INFRA: 208,
} as const;

export const LEADER_ROLE_IDS ={
    /** リーダー：競技プログラミング */
	LEADER_CP: 302,
    /** リーダー：Web */
	LEADER_WEB: 303,
    /** リーダー：AI */
	LEADER_AI: 304,
    /** リーダー：CTF */
	LEADER_CTF: 305,
    /** リーダー：モバイルアプリ */
	LEADER_MOBILE: 306,
    /** リーダー：ゲーム開発 */
	LEADER_GAME: 307,
    /** リーダー：インフラ */
	LEADER_INFRA: 308,
} as const;

export const ROLE_IDS = {
	...JOB_ROLE_IDS,
	...STATUS_ROLE_IDS,
	...TEAM_ROLE_IDS,
	...LEADER_ROLE_IDS,
} as const;

// もしROLE_IDSの値が重複していた場合、サーバーを起動する前にエラーを出す
const ROLE_IDS_VALUES = Object.values(ROLE_IDS);
if (new Set(ROLE_IDS_VALUES).size !== ROLE_IDS_VALUES.length) {
	throw new Error("Role IDは重複してはいけません");
}

export type Role = {
	id: number;
	name: string;
	color: string; // must be HEX 6-digit color code
};

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

export const ROLE_BY_ID: Record<number, Role> = {
	[ROLE_IDS.ADMIN]: {
		id: ROLE_IDS.ADMIN,
		name: "Admin",
		color: "#FF6B08",
	},
	[ROLE_IDS.MEMBER]: {
		id: ROLE_IDS.MEMBER,
		name: "Member",
		color: "#3BAC8C",
	},
	[ROLE_IDS.ACCOUNTANT]: {
		id: ROLE_IDS.ACCOUNTANT,
		name: "会計",
		color: "#548800",
	},
	[ROLE_IDS.PR]: {
		id: ROLE_IDS.PR,
		name: "広報",
		color: "#5B00D3",
	},
	[ROLE_IDS.ALUMNI]: {
		id: ROLE_IDS.ALUMNI,
		name: "卒業生",
		color: "#FF0000",
	},
	[ROLE_IDS.CP]: {
		id: ROLE_IDS.CP,
		name: "競プロ",
		color: "#C8AA00",
	},
	[ROLE_IDS.WEB]: {
		id: ROLE_IDS.WEB,
		name: "Web",
		color: "#FF1493",
	},
	[ROLE_IDS.AI]: {
		id: ROLE_IDS.AI,
		name: "広義AI",
		color: "#00BFFF",
	},
	[ROLE_IDS.CTF]: {
		id: ROLE_IDS.CTF,
		name: "CTF",
		color: "#800080",
	},
	[ROLE_IDS.MOBILE]: {
		id: ROLE_IDS.MOBILE,
		name: "モバイルアプリ",
		color: "#1F0084",
	},
	[ROLE_IDS.GAME]: {
		id: ROLE_IDS.GAME,
		name: "ゲーム開発",
		color: "#FF69B4",
	},
	[ROLE_IDS.INFRA]: {
		id: ROLE_IDS.INFRA,
		name: "インフラ",
		color: "#008000",
	},
	[ROLE_IDS.DEV]: {
		id: ROLE_IDS.DEV,
		name: "開発",
		color: "#0000FF",
	},
	[ROLE_IDS.LEADER_CP]: {
		id: ROLE_IDS.LEADER_CP,
		name: "班長：競プロ",
		color: "#C8AA00",
	},
	[ROLE_IDS.LEADER_WEB]: {
		id: ROLE_IDS.LEADER_WEB,
		name: "班長：Web",
		color: "#FF1493",
	},
	[ROLE_IDS.LEADER_AI]: {
		id: ROLE_IDS.LEADER_AI,
		name: "班長：広義AI",
		color: "#00BFFF",
	},
	[ROLE_IDS.LEADER_CTF]: {
		id: ROLE_IDS.LEADER_CTF,
		name: "班長：CTF",
		color: "#800080",
	},
	[ROLE_IDS.LEADER_MOBILE]: {
		id: ROLE_IDS.LEADER_MOBILE,
		name: "班長：モバイルアプリ",
		color: "#1F0084",
	},
	[ROLE_IDS.LEADER_GAME]: {
		id: ROLE_IDS.LEADER_GAME,
		name: "班長：ゲーム開発",
		color: "#FF69B4",
	},
	[ROLE_IDS.LEADER_INFRA]: {
		id: ROLE_IDS.LEADER_INFRA,
		name: "班長：インフラ",
		color: "#008000",
	},
};
