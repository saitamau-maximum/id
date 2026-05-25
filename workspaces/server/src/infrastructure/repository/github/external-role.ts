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

	async fetchUserRoles(
		username: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>> {
		// 「ユーザーが所属する Team 一覧」を一括取得する API が無いので、
		// candidate (管理対象 team slug) ごとに membership 確認 API を叩く。
		// active 状態 (招待承諾済み) のみを「現在持っている」と判定する。
		const checks = await Promise.all(
			Array.from(candidates).map(async (slug) => {
				const isActive = await this.octokit
					.request("GET /orgs/{org}/teams/{team_slug}/memberships/{username}", {
						org: this.orgName,
						team_slug: slug,
						username,
					})
					.then((res) => res.data.state === "active")
					.catch(() => false);
				return isActive ? slug : null;
			}),
		);
		return new Set(checks.filter((s): s is string => s !== null));
	}

	async assignRole(username: string, teamSlug: string): Promise<void> {
		await this.octokit.request(
			"PUT /orgs/{org}/teams/{team_slug}/memberships/{username}",
			{
				org: this.orgName,
				team_slug: teamSlug,
				username,
			},
		);
	}

	async removeRole(username: string, teamSlug: string): Promise<void> {
		await this.octokit.request(
			"DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}",
			{
				org: this.orgName,
				team_slug: teamSlug,
				username,
			},
		);
	}
}
