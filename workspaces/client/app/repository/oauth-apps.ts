import type {
	OAuthAppGenerateSecretResponse,
	OAuthAppGetClientByIdResponse,
	OAuthAppGetListResponse,
	OAuthAppRegisterParams,
} from "@idp/schema/api/oauth/manage";
import { client } from "~/utils/hono";

export interface IOAuthAppsRepository {
	getApps: () => Promise<OAuthAppGetListResponse>;
	getApps$$key: () => unknown[];
	getAppById: (appId: string) => Promise<OAuthAppGetClientByIdResponse>;
	getAppById$$key: (appId: string) => unknown[];
	updateManagers: (appId: string, managerUserIds: string[]) => Promise<void>;
	generateSecret: (appId: string) => Promise<OAuthAppGenerateSecretResponse>;
	updateSecretDescription: (
		appId: string,
		secretHash: string,
		description: string,
	) => Promise<void>;
	deleteSecret: (appId: string, secretHash: string) => Promise<void>;
	registerApp: (params: OAuthAppRegisterParams) => Promise<void>;
	updateApp: (appId: string, params: OAuthAppRegisterParams) => Promise<void>;
	deleteApp(appId: string): Promise<void>;
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
		const res = await client.oauth.manage[":clientId"].$get({
			param: { clientId: appId },
		});
		if (!res.ok) {
			throw new Error("Failed to fetch app");
		}
		const data = await res.json();
		return {
			...data,
			secrets: data.secrets.map((secret) => ({
				...secret,
				issuedAt: new Date(secret.issuedAt),
			})),
		};
	}

	getAppById$$key(appId: string) {
		return ["app", { clientId: appId }];
	}

	async updateManagers(appId: string, managerUserIds: string[]) {
		const res = await client.oauth.manage[":clientId"].managers.$put({
			param: { clientId: appId },
			json: { managerUserIds },
		});
		if (!res.ok) throw new Error("Failed to update managers");
	}

	async generateSecret(appId: string) {
		const res = await client.oauth.manage[":clientId"].secrets.$put({
			param: { clientId: appId },
		});
		if (!res.ok) throw new Error("Failed to generate secret");
		return res.json();
	}

	async updateSecretDescription(
		appId: string,
		secretHash: string,
		description: string,
	) {
		const res = await client.oauth.manage[":clientId"].secrets[":hash"].$put({
			param: { clientId: appId, hash: secretHash },
			json: { description },
		});
		if (!res.ok) throw new Error("Failed to update secret description");
	}

	async deleteSecret(appId: string, secretHash: string) {
		const res = await client.oauth.manage[":clientId"].secrets[":hash"].$delete(
			{
				param: { clientId: appId, hash: secretHash },
			},
		);
		if (!res.ok) throw new Error("Failed to delete secret");
	}

	async registerApp({
		name,
		description,
		scopeIds,
		callbackUrls,
		icon,
	}: OAuthAppRegisterParams) {
		const json: Parameters<
			typeof client.oauth.manage.register.$post
		>[0]["json"] = {
			name,
			description,
			scopeIds: scopeIds.map(String),
			callbackUrls,
		};

		if (icon) json.icon = icon;

		const res = await client.oauth.manage.register.$post({ json });
		if (!res.ok) throw new Error("Failed to register app");
	}

	async updateApp(
		appId: string,
		{ name, description, scopeIds, callbackUrls, icon }: OAuthAppRegisterParams,
	) {
		const json: Parameters<
			(typeof client.oauth.manage)[":clientId"]["$put"]
		>[0]["json"] = {
			name,
			description,
			scopeIds: scopeIds.map(String),
			callbackUrls,
		};

		if (icon) json.icon = icon;

		const res = await client.oauth.manage[":clientId"].$put({
			param: { clientId: appId },
			json,
		});

		if (!res.ok) throw new Error("Failed to update app");
	}

	async deleteApp(appId: string) {
		const res = await client.oauth.manage[":clientId"].$delete({
			param: { clientId: appId },
		});
		if (!res.ok) throw new Error("Failed to delete app");
	}
}
