import type { IDiscordBotRepository } from "../../../repository/discord-bot";

export class DiscordBotRepository implements IDiscordBotRepository {
	private botToken: string;
	foo = "bar";

	constructor(botToken: string) {
		this.botToken = botToken;
	}
}
