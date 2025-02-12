import type { Member } from "~/types/user";
import { client } from "~/utils/hono";

export interface IMemberRepository {
	getMembers: () => Promise<Member[]>;
	getMembers$$key(): unknown[];
	getContributionsByUserDisplayID: (userDisplayId: string) => Promise<{
		weeks: {
			date: string;
			rate: number;
		}[][];
	}>;
	getContributionsByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	getProfileByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	getProfileByUserDisplayID: (userDisplayId: string) => Promise<Member>;
}

export class MemberRepositoryImpl implements IMemberRepository {
	async getMembers() {
		const res = await client.member.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch members");
		}
		return res.json();
	}

	getMembers$$key() {
		return ["members"];
	}

	async getContributionsByUserDisplayID(userDisplayId: string) {
		const res = await client.member.contribution[":userDisplayId"].$get({
			param: {
				userDisplayId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to fetch contributions");
		}
		return res.json();
	}

	getContributionsByUserDisplayID$$key(userDisplayId: string) {
		return [
			"contribution",
			{
				userDisplayId,
			},
		];
	}

	async getProfileByUserDisplayID(userDisplayId: string) {
		const res = await client.member.profile[":userDisplayId"].$get({
			param: {
				userDisplayId,
			},
		});

		if (!res.ok) {
			throw new Error("Failed to fetch profile");
		}

		return res.json();
	}

	getProfileByUserDisplayID$$key(userDisplayId: string) {
		return [
			"profile",
			{
				userDisplayId,
			},
		];
	}
}
