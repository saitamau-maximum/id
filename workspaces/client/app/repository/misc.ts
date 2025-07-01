import type { DashboardUser } from "~/types/user";
import { client } from "~/utils/hono";

export interface IMiscRepository {
	getDashboardInfo: () => Promise<DashboardUser[]>;
	getDashboardInfo$$key: () => unknown[];
}

export class MiscRepositoryImpl implements IMiscRepository {
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
