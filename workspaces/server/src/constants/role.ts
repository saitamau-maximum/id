export const ROLE_IDS = {
	ADMIN: 1,
	MEMBER: 2,
} as const;

type RoleIds = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

type Role = {
	name: string;
};

export const ROLE_BY_ID: Record<RoleIds, Role> = {
	[ROLE_IDS.ADMIN]: {
		name: "Admin",
	},
	[ROLE_IDS.MEMBER]: {
		name: "Member",
	},
};
