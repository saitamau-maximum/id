import type { IExternalRoleProviderRepository } from "../../../repository/external-role-provider";
import type { IOrganizationRepository } from "../../../repository/organization";

export class GithubExternalRoleProviderRepository
	implements IExternalRoleProviderRepository
{
	constructor(private readonly organizationRepo: IOrganizationRepository) {}

	async fetchUserRoles(
		username: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>> {
		return await this.organizationRepo.fetchUserTeamMemberships(
			username,
			candidates,
		);
	}

	async assignRole(username: string, teamSlug: string): Promise<void> {
		await this.organizationRepo.addTeamMember(teamSlug, username);
	}

	async removeRole(username: string, teamSlug: string): Promise<void> {
		await this.organizationRepo.removeTeamMember(teamSlug, username);
	}
}
