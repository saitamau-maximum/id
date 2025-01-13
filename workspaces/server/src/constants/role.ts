export const ROLE_IDS = {
	ADMIN: 1,
	MEMBER: 2,
} as const;

export type Role = {
	id: number;
	name: string;
	color: string; // must be HEX 6-digit color code
};

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
};
