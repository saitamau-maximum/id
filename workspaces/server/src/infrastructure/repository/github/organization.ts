import { type Octokit, RequestError } from "octokit";
import type { IOrganizationRepository } from "../../../repository/organization";

export class GithubOrganizationRepository implements IOrganizationRepository {
	constructor(private readonly octokit: Octokit) {}

	async checkIsMember(
		userName: string,
		orgName = "saitamau-maximum",
	): Promise<boolean> {
		return await this.octokit
			.request("GET /orgs/{org}/members/{username}", {
				org: orgName,
				username: userName,
			})
			.then((res) => (res.status as number) === 204)
			.catch(() => false);
	}

	async inviteToOrganization(githubId: number): Promise<void> {
		await this.octokit.request("POST /orgs/{org}/invitations", {
			org: "saitamau-maximum",
			invitee_id: githubId,
		});
	}

	async isActiveTeamMember(
		teamSlug: string,
		username: string,
	): Promise<boolean> {
		return await this.octokit
			.request("GET /orgs/{org}/teams/{team_slug}/memberships/{username}", {
				org: "saitamau-maximum",
				team_slug: teamSlug,
				username,
			})
			.then((res) => res.data.state === "active")
			.catch((err) => {
				if (err instanceof RequestError && err.status === 404) return false;
				throw err;
			});
	}

	async addTeamMember(teamSlug: string, username: string): Promise<void> {
		await this.octokit.request(
			"PUT /orgs/{org}/teams/{team_slug}/memberships/{username}",
			{
				org: "saitamau-maximum",
				team_slug: teamSlug,
				username,
			},
		);
	}

	async removeTeamMember(teamSlug: string, username: string): Promise<void> {
		await this.octokit.request(
			"DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}",
			{
				org: "saitamau-maximum",
				team_slug: teamSlug,
				username,
			},
		);
	}
}
