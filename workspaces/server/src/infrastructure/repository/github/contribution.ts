import type { Contributions } from "@idp/schema/entity/contribution";
import type { Octokit } from "octokit";
import type { IContributionRepository } from "../../../repository/contribution";

const queryGetContributions = `
query ($username: String!, $organizationId: ID!) {
  user(login: $username) {
    contributionsCollection(organizationID: $organizationId) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

type QueryGetContributionsResponse = {
	user: {
		contributionsCollection: {
			contributionCalendar: {
				totalContributions: number;
				weeks: {
					contributionDays: {
						contributionCount: number;
						date: string;
					}[];
				}[];
			};
		};
	};
};

const ORGANIZATION_ID = "O_kgDOBzHRyQ"; // @saitamau-maximum

export class GithubContributionRepository implements IContributionRepository {
	constructor(private readonly octokit: Octokit) {}

	async getContributions(username: string): Promise<Contributions> {
		const data = await this.octokit.graphql<QueryGetContributionsResponse>(
			queryGetContributions,
			{
				username,
				organizationId: ORGANIZATION_ID,
			},
		);

		const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

		return weeks.map((week) =>
			week.contributionDays.map((day) => ({
				date: day.date,
				rate: Math.min(day.contributionCount / 5, 1),
			})),
		);
	}
}
