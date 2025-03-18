export const JOB_ROLE_IDS = {
	ADMIN: 1,
} as const;

export const STATUS_ROLE_IDS = {
	MEMBER: 2,
	ALUMNI: 3,
} as const;

export const TEAM_ROLE_IDS = {
	CP: 4,
	WEB: 5,
	AI: 6,
	CTF: 7,
	MOBILE: 8,
	GAME: 9,
	INFRA: 10,
	DEV: 11,
} as const;

export const ROLE_IDS = {
	...JOB_ROLE_IDS,
	...STATUS_ROLE_IDS,
	...TEAM_ROLE_IDS,
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
		color: "#ff6b08",
	},
	[ROLE_IDS.MEMBER]: {
		id: ROLE_IDS.MEMBER,
		name: "Member",
		color: "#3BAC8C",
	},
	[ROLE_IDS.ALUMNI]: {
		id: ROLE_IDS.ALUMNI,
		name: "卒業生",
		color: "#FF0000",
	},
	[ROLE_IDS.CP]: {
		id: ROLE_IDS.CP,
		name: "競プロ",
		color: "#c8aa00",
	},
	[ROLE_IDS.WEB]: {
		id: ROLE_IDS.WEB,
		name: "Web",
		color: "#FF4500",
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
		color: "#FF1493",
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
};
