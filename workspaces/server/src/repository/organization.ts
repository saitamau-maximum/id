export interface IOrganizationRepository {
	checkIsMember: (userName: string, orgName?: string) => Promise<boolean>;
	inviteToOrganization: (githubId: number) => Promise<void>;
	// 指定 username が指定 team の active メンバー (招待承諾済み) かを返す。
	// pending や not member は false。
	isActiveTeamMember: (teamSlug: string, username: string) => Promise<boolean>;
	addTeamMember: (teamSlug: string, username: string) => Promise<void>;
	removeTeamMember: (teamSlug: string, username: string) => Promise<void>;
}
