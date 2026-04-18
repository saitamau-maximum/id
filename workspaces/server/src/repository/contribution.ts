import type { Contributions } from "@idp/schema/entity/contribution";

export interface IContributionRepository {
	getContributions: (username: string) => Promise<Contributions>;
}
