import { type Octokit, RequestError } from "octokit";
import type { IOrganizationRepository } from "../../../repository/organization";

type TeamMembersQueryResult = {
	organization: Record<
		string,
		{ members: { nodes: { login: string }[] } } | null
	>;
};

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

	async isPendingTeamMember(
		teamSlug: string,
		username: string,
	): Promise<boolean> {
		return await this.octokit
			.request("GET /orgs/{org}/teams/{team_slug}/memberships/{username}", {
				org: "saitamau-maximum",
				team_slug: teamSlug,
				username,
			})
			.then((res) => res.data.state === "pending")
			.catch((err) => {
				if (err instanceof RequestError && err.status === 404) return false;
				throw err;
			});
	}

	async fetchUserTeamMemberships(
		username: string,
		teamSlugs: ReadonlySet<string>,
	): Promise<Set<string>> {
		const slugs = Array.from(teamSlugs);
		if (slugs.length === 0) return new Set();

		// 1 クエリで全チームの membership を確認する。
		// team(slug) が存在しない場合は null が返るので安全に扱える。
		// members(query) は前方一致検索のため nodes に返ってきたログインと
		// 完全一致確認を行い active 所属かを判定する。
		const teamFields = slugs
			.map(
				(slug, i) =>
					`t${i}: team(slug: "${slug}") { members(query: "${username}", first: 1) { nodes { login } } }`,
			)
			.join("\n");

		const result = await this.octokit.graphql<TeamMembersQueryResult>(`
			query {
				organization(login: "saitamau-maximum") {
					${teamFields}
				}
			}
		`);

		return new Set(
			slugs.filter((_slug, i) => {
				const nodes = result.organization[`t${i}`]?.members.nodes ?? [];
				return nodes.some(
					(n) => n.login.toLowerCase() === username.toLowerCase(),
				);
			}),
		);
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

	async fetchUserRoles(
		username: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>> {
		return this.fetchUserTeamMemberships(username, candidates);
	}

	async assignRole(username: string, teamSlug: string): Promise<void> {
		await this.addTeamMember(teamSlug, username);
	}

	async removeRole(username: string, teamSlug: string): Promise<void> {
		await this.removeTeamMember(teamSlug, username);
	}
}
