import type {
	GetMembersContributionByUserDisplayIDResponse,
	GetMembersProfileByUserDisplayIDResponse,
	GetMembersResponse,
} from "@idp/schema/api/member";
import { client } from "~/utils/hono";

export interface IMemberRepository {
	getMembers: () => Promise<GetMembersResponse>;
	getMembers$$key(): unknown[];
	getContributionsByUserDisplayID: (
		userDisplayId: string,
	) => Promise<GetMembersContributionByUserDisplayIDResponse>;
	getContributionsByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	getProfileByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	getProfileByUserDisplayID: (
		userDisplayId: string,
	) => Promise<GetMembersProfileByUserDisplayIDResponse>;
}

export class MemberRepositoryImpl implements IMemberRepository {
	async getMembers() {
		const res = await client.member.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch members");
		}
		const data = await res.json();
		return data;
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

		const data = await res.json();
		return data;
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
