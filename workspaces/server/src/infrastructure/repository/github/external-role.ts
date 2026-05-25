import type { Octokit } from "octokit";
import type {
	FetchedExternalRole,
	IExternalRoleProviderRepository,
} from "../../../repository/external-role-provider";

export class GithubExternalRoleProviderRepository
	implements IExternalRoleProviderRepository
{
	constructor(
		private readonly octokit: Octokit,
		private readonly orgName: string = "saitamau-maximum",
	) {}

	async fetchAvailableRoles(): Promise<FetchedExternalRole[]> {
		const teams = await this.octokit.paginate("GET /orgs/{org}/teams", {
			org: this.orgName,
			per_page: 100,
		});

		return teams.map((team) => ({
			externalRoleId: team.slug,
			name: team.name,
		}));
	}
}
