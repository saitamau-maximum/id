import type { Octokit } from "octokit";
import type { IOrganizationRepository } from "../../../usecase/repository/organization";

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
}
