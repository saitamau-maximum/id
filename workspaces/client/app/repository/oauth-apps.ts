import type {
	OAuthClient,
	OAuthClientCallback,
	OAuthClientSecret,
	OAuthScope,
} from "~/types/oauth";
import type { UserBasicInfo } from "~/types/user";
import { client } from "~/utils/hono";

type GetAppsRes = (OAuthClient & {
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
})[];

type GetAppByIdRes = OAuthClient & {
	callbackUrls: OAuthClientCallback["callbackUrl"][];
	scopes: OAuthScope[];
	managers: UserBasicInfo[];
	owner: UserBasicInfo;
	secrets: OAuthClientSecret[];
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
	updateSecretDescription: (
		appId: string,
		secretHash: string,
		description: string,
	) => Promise<void>;
	deleteSecret: (appId: string, secretHash: string) => Promise<void>;
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

	async updateSecretDescription(
		appId: string,
		secretHash: string,
		description: string,
	) {
		const res = await client.oauth.manage[":id"].secrets[":hash"].$put({
			param: { id: appId, hash: secretHash },
			json: { description },
		});
		if (!res.ok) throw new Error("Failed to update secret description");
	}

	async deleteSecret(appId: string, secretHash: string) {
		const res = await client.oauth.manage[":id"].secrets[":hash"].$delete({
			param: { id: appId, hash: secretHash },
		});
		if (!res.ok) throw new Error("Failed to delete secret");
	}
}
