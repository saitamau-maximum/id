import type { DashboardUser } from "~/types/user";
import { client } from "~/utils/hono";

export interface IMiscRepository {
	getDiscordInvitationURL: () => Promise<string>;
	getDiscordInvitationURL$$key: () => unknown[];
	getDashboardInfo: () => Promise<DashboardUser[]>;
	getDashboardInfo$$key: () => unknown[];
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

	async getDashboardInfo(): Promise<DashboardUser[]> {
		const res = await client.admin.dashboard.info.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch dashboard info");
		}
		const data = await res.json();
		return data.map((user) => ({
			...user,
			initializedAt: user.initializedAt
				? new Date(user.initializedAt)
				: undefined,
			lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
		}));
	}

	getDashboardInfo$$key(): unknown[] {
		return ["dashboard-info"];
	}
}
