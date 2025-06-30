import {
	type RESTGetAPICurrentUserResult,
	type RESTGetAPIGuildMemberResult,
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
		try {
			const res = await this.fetchApi(
				Routes.guildMember(this.guildId, discordUserId),
			);
			return await res.json<RESTGetAPIGuildMemberResult>();
		} catch {
			// ユーザーがサーバーに参加していない
			return null;
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
