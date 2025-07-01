import type { DiscordInfo } from "~/types/discord-info";
import { client } from "~/utils/hono";

export interface IDiscordRepository {
	getDiscordInfoByUserDisplayID: (
		userDisplayId: string,
	) => Promise<DiscordInfo>;
	getDiscordInfoByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	inviteDiscord: () => Promise<
		Awaited<
			ReturnType<
				Awaited<ReturnType<typeof client.discord.invite.$post>>["json"]
			>
		>
	>;
}

export class DiscordRepositoryImpl implements IDiscordRepository {
	async getDiscordInfoByUserDisplayID(userDisplayId: string) {
		const res = await client.discord[":userDisplayId"].$get({
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

	async inviteDiscord() {
		const res = await client.discord.invite.$post();

		if (!res.ok) {
			throw new Error("Failed to invite to Discord");
		}

		return res.json();
	}
}
