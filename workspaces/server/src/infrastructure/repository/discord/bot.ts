import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import {
	type RESTGetAPICurrentUserResult,
	type RESTGetAPIGuildMemberResult,
	type RESTPostAPIChannelMessageJSONBody,
	type RESTPostAPIChannelMessageResult,
	type RESTPutAPIGuildMemberJSONBody,
	RouteBases,
	Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
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
	private readonly db: DrizzleD1Database<typeof schema>;
	private readonly CALENDAR_URL = "https://id.maximum.vc/calendar/";

	constructor(
		botToken: string,
		guildId: string,
		calendarNotifyChannelId: string,
		d1: D1Database,
	) {
		this.botToken = botToken;
		this.guildId = guildId;
		this.calendarNotifyChannelId = calendarNotifyChannelId;
		this.db = drizzle(d1, { schema });
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

	async assignGuildMemberRole(userId: string, roleId: string): Promise<void> {
		const res = await this.fetchApi(
			Routes.guildMemberRole(this.guildId, userId, roleId),
			{ method: "PUT" },
		);
		if (!res.ok) {
			throw new Error(
				`Failed to assign Discord role ${roleId} to ${userId}: ${res.status} ${res.statusText}`,
			);
		}
	}

	async removeGuildMemberRole(userId: string, roleId: string): Promise<void> {
		const res = await this.fetchApi(
			Routes.guildMemberRole(this.guildId, userId, roleId),
			{ method: "DELETE" },
		);
		if (!res.ok) {
			throw new Error(
				`Failed to remove Discord role ${roleId} from ${userId}: ${res.status} ${res.statusText}`,
			);
		}
	}

	async fetchUserRoles(snowflake: string): Promise<Set<string>> {
		const rows = await this.db.query.externalRoles.findMany({
			where: eq(schema.externalRoles.providerId, OAUTH_PROVIDER_IDS.DISCORD),
		});
		const managed = new Set(rows.map((r) => r.roleId));
		const member = await this.getGuildMember(snowflake);
		if (member === null) return new Set();
		return new Set(member.roles.filter((r) => managed.has(r)));
	}

	async assignRoles(
		snowflake: string,
		roleIds: string[],
	): Promise<{ roleId: string; error: unknown }[]> {
		const settled = await Promise.allSettled(
			roleIds.map((roleId) => this.assignGuildMemberRole(snowflake, roleId)),
		);
		return settled.flatMap((res, i) =>
			res.status === "rejected"
				? [{ roleId: roleIds[i], error: res.reason }]
				: [],
		);
	}

	async removeRoles(
		snowflake: string,
		roleIds: string[],
	): Promise<{ roleId: string; error: unknown }[]> {
		const settled = await Promise.allSettled(
			roleIds.map((roleId) => this.removeGuildMemberRole(snowflake, roleId)),
		);
		return settled.flatMap((res, i) =>
			res.status === "rejected"
				? [{ roleId: roleIds[i], error: res.reason }]
				: [],
		);
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
