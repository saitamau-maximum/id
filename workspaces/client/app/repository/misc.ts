import { client } from "~/utils/hono";

export interface IMiscRepository {
	getDiscordInvitationURL: () => Promise<string>;
	getDiscordInvitationURL$$key: () => unknown[];
}

export class MiscRepositoryImpl implements IMiscRepository {
	async getDiscordInvitationURL(): Promise<string> {
		const res = await client.misc.discord.invitation.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch discord invitation url");
		}
		const data = await res.json();
		return data.url;
	}

	getDiscordInvitationURL$$key(): unknown[] {
		return ["discord-invitation-url"];
	}
}
