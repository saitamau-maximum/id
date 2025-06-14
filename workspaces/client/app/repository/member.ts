import type { DiscordInfo } from "~/types/discord-info";
import type {
	Member,
	WithCertifications,
	WithOAuthConnections,
} from "~/types/user";
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
	getProfileByUserDisplayID: (
		userDisplayId: string,
	) => Promise<WithOAuthConnections<WithCertifications<Member>>>;
	getDiscordInfoByUserDisplayID: (
		userDisplayId: string,
	) => Promise<DiscordInfo>;
	getDiscordInfoByUserDisplayID$$key: (userDisplayId: string) => unknown[];
}

export class MemberRepositoryImpl implements IMemberRepository {
	async getMembers() {
		const res = await client.member.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch members");
		}
		const data = await res.json();
		return data.map((member) => ({
			...member,
			initializedAt: member.initializedAt
				? new Date(member.initializedAt)
				: undefined,
			lastLoginAt: member.lastLoginAt
				? new Date(member.lastLoginAt)
				: undefined,
		}));
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
		return {
			...data,
			initializedAt: data.initializedAt
				? new Date(data.initializedAt)
				: undefined,
			lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
		};
	}

	getProfileByUserDisplayID$$key(userDisplayId: string) {
		return [
			"profile",
			{
				userDisplayId,
			},
		];
	}

	async getDiscordInfoByUserDisplayID(userDisplayId: string) {
		const res = await client.member.discord[":userDisplayId"].$get({
			param: {
				userDisplayId,
			},
		});

		if (!res.ok) {
			throw new Error("Failed to fetch Discord info");
		}

		return res.json();
	}
	getDiscordInfoByUserDisplayID$$key(userDisplayId: string) {
		return [
			"discord",
			{
				userDisplayId,
			},
		];
	}
}
