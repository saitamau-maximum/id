import type { RESTGetAPIGuildMemberResult } from "discord-api-types/v10";

export interface IDiscordBotRepository {
	getGuildMember(memberId: string): Promise<RESTGetAPIGuildMemberResult>;
}
