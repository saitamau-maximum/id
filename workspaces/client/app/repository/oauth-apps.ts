import { client } from "~/utils/hono";
import type { User } from "./auth";

interface OAuthApp {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	ownerId: string;
}

type UserBasicInfo = Pick<
	User,
	"id" | "displayId" | "displayName" | "profileImageURL"
>;

type GetAppsRes = (OAuthApp & {
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
})[];

export interface IOAuthAppsRepository {
	getApps: () => Promise<GetAppsRes>;
	getApps$$key: () => unknown[];
}

export class OAuthAppsRepositoryImpl implements IOAuthAppsRepository {
	async getApps() {
		const res = await client.oauth.manage.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch apps");
		}
		return res.json();
	}

	getApps$$key() {
		return ["apps"];
	}
}
