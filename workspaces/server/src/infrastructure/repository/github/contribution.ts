import type { Octokit } from "@octokit/core";
import type {
	Contribitions,
	IContributionRepository,
} from "../../../usecase/repository/contribution";

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

	async getContributions(username: string): Promise<Contribitions> {
		const data = await this.octokit.graphql<QueryGetContributionsResponse>(
			queryGetContributions,
			{
				username,
				organizationId: ORGANIZATION_ID,
			},
		);

		const weeks = data.user.contributionsCollection.contributionCalendar.weeks;
		const maxContributions = Math.max(
			...weeks.flatMap((week) =>
				week.contributionDays.map((day) => day.contributionCount),
			),
		);

		return {
			weeks: weeks.map((week) =>
				week.contributionDays.map((day) => ({
					date: new Date(day.date),
					rate: day.contributionCount / maxContributions, // とりあえず最大値で割って正規化
				})),
			),
		};
	}
}
