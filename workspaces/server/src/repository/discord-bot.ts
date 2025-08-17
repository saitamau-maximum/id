import type {
	RESTGetAPICurrentUserResult,
	RESTGetAPIGuildMemberResult,
	RESTPostAPIChannelMessageJSONBody,
	RESTPostAPIChannelMessageResult,
} from "discord-api-types/v10";
import type { ICalendarEventWithLocation } from "./calendar";

export type DiscordAddGuildMemberResult = "failed" | "already_joined" | "added";
export type CalendarNotifyType = "new" | "update";
export type CalendarEventForNotification = Omit<
	ICalendarEventWithLocation,
	"id"
>;

export interface IDiscordBotRepository {
	getGuildMember(memberId: string): Promise<RESTGetAPIGuildMemberResult | null>;
	addGuildMember(accessToken: string): Promise<DiscordAddGuildMemberResult>;
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
