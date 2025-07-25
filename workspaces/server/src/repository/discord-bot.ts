import type {
	RESTGetAPICurrentUserResult,
	RESTGetAPIGuildMemberResult,
} from "discord-api-types/v10";

export type DiscordAddGuildMemberResult = "failed" | "already_joined" | "added";

export interface IDiscordBotRepository {
	getGuildMember(memberId: string): Promise<RESTGetAPIGuildMemberResult | null>;
	addGuildMember(accessToken: string): Promise<DiscordAddGuildMemberResult>;
	fetchUserByAccessToken(
		accessToken: string,
	): Promise<RESTGetAPICurrentUserResult>;
}
