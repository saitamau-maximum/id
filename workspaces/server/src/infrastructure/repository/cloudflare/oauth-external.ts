import { and, eq, inArray } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { ROLE_BY_ID } from "../../../constants/role";
import { type Scope, getScopeById } from "../../../constants/scope";
import * as schema from "../../../db/schema";
import { binaryToBase64 } from "../../../utils/oauth/convert-bin-base64";
import type { IOAuthExternalRepository } from "./../../../repository/oauth-external";

// user table から基本的な情報を取得するためのやつ
const USER_BASIC_INFO_COLUMNS_GETTER = {
	columns: {
		id: true,
	},
	with: {
		roles: true,
		profile: {
			columns: {
				displayId: true,
				displayName: true,
				profileImageURL: true,
			},
		},
	},
} as const;
type UserBasicInfoRawData = {
	id: string;
	profile: {
		displayId: string | null;
		displayName: string | null;
		profileImageURL: string | null;
	};
	roles: { userId: string; roleId: number }[];
};
const USER_BASIC_INFO_TRANSFORMER = (user: UserBasicInfoRawData) => ({
	id: user.id,
	displayId: user.profile.displayId ?? undefined,
	displayName: user.profile.displayName ?? undefined,
	profileImageURL: user.profile.profileImageURL ?? undefined,
	roles: user.roles.map((role) => ROLE_BY_ID[role.roleId]),
});

export class CloudflareOAuthExternalRepository
	implements IOAuthExternalRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getClientById(clientId: string) {
		const res = await this.client.query.oauthClients.findFirst({
			where: (client, { eq }) => eq(client.id, clientId),
			with: {
				secrets: {
					orderBy({ issuedAt }, { asc }) {
						return asc(issuedAt);
					},
				},
				callbacks: true,
				scopes: true,
				managers: {
					with: {
						user: USER_BASIC_INFO_COLUMNS_GETTER,
					},
				},
				owner: USER_BASIC_INFO_COLUMNS_GETTER,
			},
		});

		if (!res) return undefined;

		const { callbacks, scopes, managers, owner, ...client } = res;

		return {
			...client,
			callbackUrls: callbacks.map((callback) => callback.callbackUrl),
			scopes: scopes.map((clientScope) => getScopeById(clientScope.scopeId)),
			managers: managers
				.map((manager) => manager.user)
				.map(USER_BASIC_INFO_TRANSFORMER),
			owner: USER_BASIC_INFO_TRANSFORMER(owner),
		};
	}

	// ----- management ----- //

	async getClients() {
		const res = await this.client.query.oauthClients.findMany({
			with: {
				managers: {
					with: {
						user: USER_BASIC_INFO_COLUMNS_GETTER,
					},
				},
				owner: USER_BASIC_INFO_COLUMNS_GETTER,
			},
		});

		return res.map((client) => ({
			...client,
			managers: client.managers
				.map((manager) => manager.user)
				.map(USER_BASIC_INFO_TRANSFORMER),
			owner: USER_BASIC_INFO_TRANSFORMER(client.owner),
		}));
	}

	async updateManagers(clientId: string, userIds: string[]) {
		const client = await this.client.query.oauthClients.findFirst({
			where: (client, { eq }) => eq(client.id, clientId),
		});
		if (!client) throw new Error("Client not found");

		const res1 = await this.client
			.delete(schema.oauthClientManagers)
			.where(eq(schema.oauthClientManagers.clientId, clientId));

		if (!res1.success) throw new Error("Failed to delete managers");

		const res2 = await this.client.insert(schema.oauthClientManagers).values(
			userIds.map((userId) => ({
				clientId,
				userId,
			})),
		);

		if (!res2.success) throw new Error("Failed to insert managers");
	}

	async generateClientSecret(clientId: string, userId: string) {
		const secret = binaryToBase64(crypto.getRandomValues(new Uint8Array(39)));

		const res = await this.client.insert(schema.oauthClientSecrets).values({
			clientId,
			secret,
			description: "",
			issuedAt: new Date(),
			issuedBy: userId,
		});

		if (!res.success) throw new Error("Failed to insert secret");
		return secret;
	}

	async updateClientSecretDescription(
		clientId: string,
		secret: string,
		description: string,
	) {
		const res = await this.client
			.update(schema.oauthClientSecrets)
			.set({ description })
			.where(
				and(
					eq(schema.oauthClientSecrets.clientId, clientId),
					eq(schema.oauthClientSecrets.secret, secret),
				),
			);

		if (!res.success) throw new Error("Failed to update secret description");
	}

	async deleteClientSecret(clientId: string, secret: string) {
		const res = await this.client
			.delete(schema.oauthClientSecrets)
			.where(
				and(
					eq(schema.oauthClientSecrets.clientId, clientId),
					eq(schema.oauthClientSecrets.secret, secret),
				),
			);

		if (!res.success) throw new Error("Failed to delete secret");
	}

	async registerClient(
		clientId: string,
		userId: string,
		name: string,
		description: string,
		scopeIds: number[],
		callbackUrls: string[],
		logoUrl: string | null,
	) {
		const res = await this.client.batch([
			this.client.insert(schema.oauthClients).values({
				id: clientId,
				ownerId: userId,
				name,
				description,
				logoUrl,
			}),
			this.client.insert(schema.oauthClientManagers).values({
				clientId,
				userId,
			}),
			this.client.insert(schema.oauthClientCallbacks).values(
				callbackUrls.map((callbackUrl) => ({
					clientId,
					callbackUrl,
				})),
			),
			this.client.insert(schema.oauthClientScopes).values(
				scopeIds.map((scopeId) => ({
					clientId,
					scopeId,
				})),
			),
		]);

		if (!res.every((r) => r.success))
			throw new Error("Failed to register client");
	}

	async updateClient(
		clientId: string,
		name: string,
		description: string,
		scopeIds: number[],
		callbackUrls: string[],
		logoUrl: string | null,
	) {
		const oauthClientParams: {
			name: string;
			description: string;
			logoUrl?: string;
		} = {
			name,
			description,
		};
		if (logoUrl) oauthClientParams.logoUrl = logoUrl;

		const res = await this.client.batch([
			this.client
				.update(schema.oauthClients)
				.set(oauthClientParams)
				.where(eq(schema.oauthClients.id, clientId)),
			this.client
				.delete(schema.oauthClientCallbacks)
				.where(eq(schema.oauthClientCallbacks.clientId, clientId)),
			this.client.insert(schema.oauthClientCallbacks).values(
				callbackUrls.map((callbackUrl) => ({
					clientId,
					callbackUrl,
				})),
			),
			this.client
				.delete(schema.oauthClientScopes)
				.where(eq(schema.oauthClientScopes.clientId, clientId)),
			this.client.insert(schema.oauthClientScopes).values(
				scopeIds.map((scopeId) => ({
					clientId,
					scopeId,
				})),
			),
		]);

		if (!res.every((r) => r.success))
			throw new Error("Failed to update client");
	}

	async deleteClient(clientId: string) {
		const res = await this.client.batch([
			// clientId に紐づく token scopes を削除
			this.client
				.delete(schema.oauthTokenScopes)
				.where(
					inArray(
						schema.oauthTokenScopes.tokenId,
						// client.query ではなく .select にすることで、
						// クエリを構築するだけにして取得処理は行わないようにする
						this.client
							.select({ clientId: schema.oauthTokens.clientId })
							.from(schema.oauthTokens)
							.where(eq(schema.oauthTokens.clientId, clientId)),
					),
				),
			// そしたら依存関係が取り除かれるので、 token などを削除
			this.client
				.delete(schema.oauthTokens)
				.where(eq(schema.oauthTokens.clientId, clientId)),
			this.client
				.delete(schema.oauthClientScopes)
				.where(eq(schema.oauthClientScopes.clientId, clientId)),
			this.client
				.delete(schema.oauthClientCallbacks)
				.where(eq(schema.oauthClientCallbacks.clientId, clientId)),
			this.client
				.delete(schema.oauthClientSecrets)
				.where(eq(schema.oauthClientSecrets.clientId, clientId)),
			this.client
				.delete(schema.oauthClientManagers)
				.where(eq(schema.oauthClientManagers.clientId, clientId)),
			// すべてを消してから client を消す
			this.client
				.delete(schema.oauthClients)
				.where(eq(schema.oauthClients.id, clientId)),
		]);

		if (!res.every((r) => r.success))
			throw new Error("Failed to delete client");
	}

	// ----- OAuth flow に関する処理 ----- //

	async createAccessToken(
		clientId: string,
		userId: string,
		code: string,
		redirectUri: string | undefined,
		accessToken: string,
		scopes: Scope[],
	) {
		const time = Date.now();

		// transaction が使えないが、 batch だと autoincrement な token id を取得できないので、 Cloudflare の力を信じてふつうに insert する
		const tokenInsertRes = await this.client
			.insert(schema.oauthTokens)
			.values({
				clientId,
				userId,
				code,
				codeExpiresAt: new Date(time + 1 * 60 * 1000), // 1 min
				codeUsed: false,
				redirectUri,
				accessToken,
				accessTokenExpiresAt: new Date(time + 1 * 60 * 60 * 1000), // 1 hour
			})
			.returning();

		const insertedToken = tokenInsertRes.at(0);

		if (!insertedToken) {
			throw new Error("Failed to insert token");
		}

		const tokenScopeInsertRes = await this.client
			.insert(schema.oauthTokenScopes)
			.values(
				scopes.map((scope) => ({
					tokenId: insertedToken.id,
					scopeId: scope.id,
				})),
			);

		if (!tokenScopeInsertRes.success) {
			throw new Error("Failed to insert token scope");
		}
	}

	async getTokenByCode(code: string) {
		const res = await this.client.query.oauthTokens.findFirst({
			where: (token, { eq, and, gt }) =>
				and(eq(token.code, code), gt(token.codeExpiresAt, new Date())),
			with: {
				client: {
					with: {
						secrets: true,
					},
				},
				scopes: true,
			},
		});

		if (!res) return undefined;

		const { scopes, ...token } = res;

		return {
			...token,
			scopes: scopes.map((scope) => getScopeById(scope.scopeId)),
		};
	}

	async deleteTokenById(tokenId: number) {
		const res = await this.client.batch([
			// 順番を逆にすると外部キー制約で落ちるよ (戒め)
			// token に紐づく scope を削除
			this.client
				.delete(schema.oauthTokenScopes)
				.where(eq(schema.oauthTokenScopes.tokenId, tokenId)),
			// token を削除
			this.client
				.delete(schema.oauthTokens)
				.where(eq(schema.oauthTokens.id, tokenId)),
		]);

		if (res.some((r) => !r.success)) {
			throw new Error("Failed to delete token");
		}
	}

	async setCodeUsed(code: string) {
		const res = await this.client
			.update(schema.oauthTokens)
			.set({ codeUsed: true })
			.where(eq(schema.oauthTokens.code, code));

		if (!res.success) {
			throw new Error("Failed to set code used");
		}
	}

	async getTokenByAccessToken(accessToken: string) {
		const res = await this.client.query.oauthTokens.findFirst({
			where: (token, { eq, and, gt }) =>
				and(
					eq(token.accessToken, accessToken),
					gt(token.accessTokenExpiresAt, new Date()),
				),
			with: {
				client: true,
				scopes: true,
				user: USER_BASIC_INFO_COLUMNS_GETTER,
			},
		});

		if (!res) return undefined;

		const { scopes, user, ...token } = res;

		return {
			...token,
			scopes: scopes.map((scope) => getScopeById(scope.scopeId)),
			user: USER_BASIC_INFO_TRANSFORMER(user),
		};
	}

	async deleteExpiredAccessTokens() {
		// 有効期限ジャストに使われるかもしれないので、念のため 1 日前のものを削除
		const now = new Date().valueOf() - 1 * 24 * 60 * 60 * 1000;

		// まず一覧を取得
		const expiredTokenIds = (
			await this.client.query.oauthTokens.findMany({
				where: (token, { lt }) => lt(token.accessTokenExpiresAt, new Date(now)),
				columns: {
					id: true,
				},
			})
		).map((record) => record.id);

		// 次に token に紐づいた scopes を削除
		await this.client
			.delete(schema.oauthTokenScopes)
			.where(inArray(schema.oauthTokenScopes.tokenId, expiredTokenIds));

		// 最後に tokens を削除
		await this.client
			.delete(schema.oauthTokens)
			.where(inArray(schema.oauthTokens.id, expiredTokenIds));
	}
}
