import {
	type RESTGetAPICurrentUserResult,
	type RESTGetAPIGuildMemberResult,
	type RESTPostAPIChannelMessageJSONBody,
	type RESTPostAPIChannelMessageResult,
	type RESTPutAPIGuildMemberJSONBody,
	RouteBases,
	Routes,
} from "discord-api-types/v10";
import type {
	CalendarEventForNotification,
	CalendarNotifyType,
	IDiscordBotRepository,
} from "../../../repository/discord-bot";
import { formatDuration } from "../../../utils/date";

export class DiscordBotRepository implements IDiscordBotRepository {
	private botToken: string;
	private guildId: string;
	private calendarNotifyChannelId: string;
	private readonly CALENDAR_URL = "https://id.maximum.vc/calendar/";

	constructor(
		botToken: string,
		guildId: string,
		calendarNotifyChannelId: string,
	) {
		this.botToken = botToken;
		this.guildId = guildId;
		this.calendarNotifyChannelId = calendarNotifyChannelId;
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

	async sendMessage(
		channelId: string,
		params: RESTPostAPIChannelMessageJSONBody,
	): Promise<RESTPostAPIChannelMessageResult> {
		const res = await this.fetchApi(Routes.channelMessages(channelId), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});
		return await res.json<RESTPostAPIChannelMessageResult>();
	}

	async sendCalendarNotification(
		type: CalendarNotifyType,
		event: CalendarEventForNotification,
	): Promise<void> {
		await this.sendMessage(this.calendarNotifyChannelId, {
			content:
				type === "new"
					? `🗓️ 予定「${event.title}」が追加されました！`
					: `✏️ 予定「${event.title}」が更新されました！`,
			embeds: [
				{
					description: event.description,
					color: type === "new" ? 0x2ecc71 : 0x3498db,
					fields: [
						{
							name: "日時",
							value: formatDuration(event.startAt, event.endAt),
						},
						{
							name: "場所",
							value: event.location?.name || "未定",
						},
					],
					footer: {
						// [URL](URL) の形式にしてもリンクにならなかったので、 URL だけ表示することで妥協
						text: `${this.CALENDAR_URL}`,
					},
				},
			],
		});
	}
}
