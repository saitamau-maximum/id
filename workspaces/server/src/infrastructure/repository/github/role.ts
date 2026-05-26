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
		const checks = await Promise.all(
			Array.from(candidates).map(async (slug) => {
				const isActive = await this.organizationRepo.isActiveTeamMember(
					slug,
					username,
				);
				return isActive ? slug : null;
			}),
		);
		return new Set(checks.filter((s): s is string => s !== null));
	}

	async assignRole(username: string, teamSlug: string): Promise<void> {
		await this.organizationRepo.addTeamMember(teamSlug, username);
	}

	async removeRole(username: string, teamSlug: string): Promise<void> {
		await this.organizationRepo.removeTeamMember(teamSlug, username);
	}
}
