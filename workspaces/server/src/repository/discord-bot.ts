import type { EventWithLocation } from "@idp/schema/entity/calendar/event";
import type { DiscordInviteResult } from "@idp/schema/entity/oauth-internal/discord-info";
import type {
	RESTGetAPICurrentUserResult,
	RESTGetAPIGuildMemberResult,
	RESTPostAPIChannelMessageJSONBody,
	RESTPostAPIChannelMessageResult,
} from "discord-api-types/v10";

export type CalendarNotifyType = "new" | "update";
export type CalendarEventForNotification = Omit<EventWithLocation, "id">;

export interface IDiscordBotRepository {
	getGuildMember(memberId: string): Promise<RESTGetAPIGuildMemberResult | null>;
	addGuildMember(accessToken: string): Promise<DiscordInviteResult>;
	fetchUserByAccessToken(
		accessToken: string,
	): Promise<RESTGetAPICurrentUserResult>;
	sendMessage(
		channelId: string,
		params: RESTPostAPIChannelMessageJSONBody,
	): Promise<RESTPostAPIChannelMessageResult>;
	sendCalendarNotification(
		type: CalendarNotifyType,
		event: CalendarEventForNotification,
	): Promise<void>;
}
