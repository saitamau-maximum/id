import {
	type RESTGetAPICurrentUserResult,
	type RESTGetAPIGuildMemberResult,
	type RESTPutAPIGuildMemberJSONBody,
	RouteBases,
	Routes,
} from "discord-api-types/v10";
import type { IDiscordBotRepository } from "../../../repository/discord-bot";

export class DiscordBotRepository implements IDiscordBotRepository {
	private botToken: string;
	private guildId: string;

	constructor(botToken: string, guildId: string) {
		this.botToken = botToken;
		this.guildId = guildId;
	}

	private async fetchApi(endpoint: string, options?: RequestInit) {
		return await fetch(RouteBases.api + endpoint, {
			...options,
			headers: {
				Authorization: `Bot ${this.botToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async getGuildMember(discordUserId: string) {
		const res = await this.fetchApi(
			Routes.guildMember(this.guildId, discordUserId),
		);

		if (!res.ok) {
			// ユーザーがサーバーに参加していない
			return null;
		}

		return await res.json<RESTGetAPIGuildMemberResult>();
	}

	async addGuildMember(accessToken: string) {
		const user = await this.fetchUserByAccessToken(accessToken);

		const payload: RESTPutAPIGuildMemberJSONBody = {
			access_token: accessToken,
		};

		try {
			const res = await this.fetchApi(
				Routes.guildMember(this.guildId, user.id),
				{
					method: "PUT",
					body: JSON.stringify(payload),
				},
			);

			if (res.status === 201) return "added";
			if (res.status === 204) return "already_joined";

			throw new Error(`Unexpected status code: ${res.status}`);
		} catch {
			return "failed";
		}
	}

	async fetchUserByAccessToken(accessToken: string) {
		const endpoint = RouteBases.api + Routes.user("@me");
		const res = await fetch(endpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return await res.json<RESTGetAPICurrentUserResult>();
	}
}
