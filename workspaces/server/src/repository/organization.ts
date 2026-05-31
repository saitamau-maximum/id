export interface IOrganizationRepository {
	checkIsMember: (userName: string, orgName?: string) => Promise<boolean>;
	inviteToOrganization: (githubId: number) => Promise<void>;
	// 指定 username が指定 team の active メンバー (招待承諾済み) かを返す。
	// pending や not member は false。
	isActiveTeamMember: (teamSlug: string, username: string) => Promise<boolean>;
	// 指定 username が所属する team slugs を一括取得する (GraphQL で 1 クエリ)。
	fetchUserTeamMemberships: (
		username: string,
		teamSlugs: ReadonlySet<string>,
	) => Promise<Set<string>>;
	addTeamMember: (teamSlug: string, username: string) => Promise<void>;
	removeTeamMember: (teamSlug: string, username: string) => Promise<void>;
	fetchUserRoles: (
		username: string,
		candidates: ReadonlySet<string>,
	) => Promise<Set<string>>;
	assignRole: (username: string, teamSlug: string) => Promise<void>;
	removeRole: (username: string, teamSlug: string) => Promise<void>;
}
