export interface IOrganizationRepository {
	checkIsMember: (userName: string, orgName?: string) => Promise<boolean>;
	inviteToOrganization: (githubId: number) => Promise<void>;
}
