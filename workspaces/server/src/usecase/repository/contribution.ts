export type Contribitions = {
	weeks: {
		date: Date;
		/** The number of contributions made on the date. */
		rate: number;
	}[][];
};

export interface IContributionRepository {
	getContributions: (username: string) => Promise<Contribitions>;
}
