import type {
	GetDiscordInfoResponse,
	PostInviteDiscordResponse,
} from "@idp/schema/api/discord";
import { client } from "~/utils/hono";

export interface IDiscordRepository {
	getDiscordInfoByUserDisplayID: (
		userDisplayId: string,
	) => Promise<GetDiscordInfoResponse>;
	getDiscordInfoByUserDisplayID$$key: (userDisplayId: string) => unknown[];
	inviteDiscord: () => Promise<PostInviteDiscordResponse>;
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

		return res.text();
	}
}
