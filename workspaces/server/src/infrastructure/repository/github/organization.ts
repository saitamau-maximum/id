import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { type Octokit, RequestError } from "octokit";
import * as schema from "../../../db/schema";
import type { IOrganizationRepository } from "../../../repository/organization";

type TeamMembershipQueryResult = {
	organization: Record<
		string,
		{
			members: { nodes: { login: string }[] };
			invitations: { nodes: { invitee: { login: string } | null }[] };
		} | null
	>;
};

export class GithubOrganizationRepository implements IOrganizationRepository {
	private readonly db: DrizzleD1Database<typeof schema>;

	constructor(
		private readonly octokit: Octokit,
		d1: D1Database,
	) {
		this.db = drizzle(d1, { schema });
	}

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

		// active と pending 両方を 1 クエリで取得する。
		// pending 招待を含めないと、条件を満たさなくなったユーザーへの招待が
		// diff に現れず、後で承認されたときに不正なロールが付与されてしまう。
		// invitations の first は上限が 100。(GitHub GraphQL)
		const teamFields = slugs
			.map(
				(slug, i) =>
					`t${i}: team(slug: "${slug}") {
						members(query: "${username}", first: 1) { nodes { login } }
						invitations(first: 100) { nodes { invitee { login } } }
					}`,
			)
			.join("\n");

		const result = await this.octokit.graphql<TeamMembershipQueryResult>(`
			query {
				organization(login: "saitamau-maximum") {
					${teamFields}
				}
			}
		`);

		return new Set(
			slugs.filter((_slug, i) => {
				const team = result.organization[`t${i}`];
				if (!team) return false;
				const lc = username.toLowerCase();
				return (
					team.members.nodes.some((n) => n.login.toLowerCase() === lc) ||
					team.invitations.nodes.some(
						(n) => n.invitee?.login?.toLowerCase() === lc,
					)
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

	async fetchUserRoles(username: string): Promise<Set<string>> {
		const rows = await this.db.query.externalRoles.findMany({
			where: eq(schema.externalRoles.providerId, OAUTH_PROVIDER_IDS.GITHUB),
		});
		const teamSlugs = new Set(rows.map((r) => r.roleId));
		return this.fetchUserTeamMemberships(username, teamSlugs);
	}

	async assignRoles(
		username: string,
		teamSlugs: string[],
	): Promise<{ roleId: string; error: unknown }[]> {
		const settled = await Promise.allSettled(
			teamSlugs.map((teamSlug) => this.addTeamMember(teamSlug, username)),
		);
		return settled.flatMap((res, i) =>
			res.status === "rejected"
				? [{ roleId: teamSlugs[i], error: res.reason }]
				: [],
		);
	}

	async removeRoles(
		username: string,
		teamSlugs: string[],
	): Promise<{ roleId: string; error: unknown }[]> {
		const settled = await Promise.allSettled(
			teamSlugs.map((teamSlug) => this.removeTeamMember(teamSlug, username)),
		);
		return settled.flatMap((res, i) =>
			res.status === "rejected"
				? [{ roleId: teamSlugs[i], error: res.reason }]
				: [],
		);
	}
}
