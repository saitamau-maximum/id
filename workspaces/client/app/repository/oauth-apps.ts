import { client } from "~/utils/hono";
import type { User } from "./auth";

interface Client {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	ownerId: string;
}
export type UserBasicInfo = Pick<
	User,
	"id" | "displayId" | "displayName" | "profileImageURL"
>;
type Scope = {
	id: number;
	name: string;
	description: string | null;
};
type ClientSecret = {
	secret: string;
	secretHash: string;
	description: string | null;
	issuedBy: string;
	issuedAt: string;
};
type ClientCallback = {
	clientId: Client["id"];
	callbackUrl: string;
};

type GetAppsRes = (Client & {
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
})[];

type GetAppByIdRes = Client & {
	callbackUrls: ClientCallback["callbackUrl"][];
	scopes: Scope[];
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
	secrets: ClientSecret[];
};

export interface IOAuthAppsRepository {
	getApps: () => Promise<GetAppsRes>;
	getApps$$key: () => unknown[];
	getAppById: (appId: string) => Promise<GetAppByIdRes>;
	getAppById$$key: (appId: string) => unknown[];
	addManagers: (appId: string, managers: string[]) => Promise<void>;
	deleteManagers: (appId: string, managers: string[]) => Promise<void>;
	generateSecret: (
		appId: string,
	) => Promise<{ secret: string; secretHash: string }>;
	deleteSecretByHash: (appId: string, secretHash: string) => Promise<void>;
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

	async getAppById(appId: string) {
		const res = await client.oauth.manage[":id"].$get({
			param: { id: appId },
		});
		if (!res.ok) {
			throw new Error("Failed to fetch app");
		}
		return res.json();
	}

	getAppById$$key(appId: string) {
		return ["app", { id: appId }];
	}

	async addManagers(appId: string, managers: string[]) {
		const res = await client.oauth.manage[":id"].managers.$put({
			param: { id: appId },
			json: { managers },
		});
		if (!res.ok) throw new Error("Failed to add managers");
	}

	async deleteManagers(appId: string, managers: string[]) {
		const res = await client.oauth.manage[":id"].managers.$delete({
			param: { id: appId },
			json: { managers },
		});
		if (!res.ok) throw new Error("Failed to delete managers");

		// TODO: もし自分が含まれていたらどうにかする
	}

	async generateSecret(appId: string) {
		const res = await client.oauth.manage[":id"].secrets.$put({
			param: { id: appId },
		});
		if (!res.ok) throw new Error("Failed to generate secret");
		return res.json();
	}

	async deleteSecretByHash(appId: string, secretHash: string) {
		const res = await client.oauth.manage[":id"].secrets.$delete({
			param: { id: appId },
			json: { hash: secretHash },
		});
		if (!res.ok) throw new Error("Failed to delete secret");
	}
}
