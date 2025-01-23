import { and, eq, inArray } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { binaryToBase64 } from "../../../utils/oauth/convert-bin-base64";
import type {
	IOAuthExternalRepository,
	Scope,
} from "./../../../repository/oauth-external";

// user table から基本的な情報を取得するためのやつ
const USER_BASIC_INFO_COLUMNS_GETTER = {
	columns: {
		id: true,
	},
	with: {
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
};
const USER_BASIC_INFO_TRANSFORMER = (user: UserBasicInfoRawData) => ({
	id: user.id,
	displayId: user.profile.displayId ?? undefined,
	displayName: user.profile.displayName ?? undefined,
	profileImageURL: user.profile.profileImageURL ?? undefined,
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
				scopes: {
					with: {
						scope: true,
					},
				},
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
			scopes: scopes.map((clientScope) => clientScope.scope),
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

	async addManagers(clientId: string, userDisplayIds: string[]) {
		// userDisplayId -> userId
		const users = await this.client.query.userProfiles.findMany({
			where: (profile, { inArray }) =>
				inArray(profile.displayId, userDisplayIds),
			columns: {
				userId: true,
			},
		});
		if (users.length !== userDisplayIds.length)
			throw new Error("Some users not found");

		// 同じ user を複数追加しようとした場合は unique 制約でエラーになる
		const res = await this.client.insert(schema.oauthClientManagers).values(
			users.map((user) => ({
				clientId,
				userId: user.userId,
			})),
		);

		if (!res.success) throw new Error("Failed to insert managers");
	}

	async deleteManagers(clientId: string, userDisplayIds: string[]) {
		const users = await this.client.query.userProfiles.findMany({
			where: (profile, { inArray }) =>
				inArray(profile.displayId, userDisplayIds),
			columns: {
				userId: true,
			},
		});
		if (users.length !== userDisplayIds.length)
			throw new Error("Some users not found");

		const client = await this.client.query.oauthClients.findFirst({
			where: (client, { eq }) => eq(client.id, clientId),
		});
		if (!client) throw new Error("Client not found");

		// owner は削除させない
		if (users.some((user) => user.userId === client.ownerId))
			throw new Error("Cannot delete owner");

		const res = await this.client.delete(schema.oauthClientManagers).where(
			and(
				eq(schema.oauthClientManagers.clientId, clientId),
				inArray(
					schema.oauthClientManagers.userId,
					users.map((u) => u.userId),
				),
			),
		);

		if (!res.success) throw new Error("Failed to delete managers");
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
				scopes: {
					with: {
						scope: true,
					},
				},
			},
		});

		if (!res) return undefined;

		const { scopes, ...token } = res;

		return {
			...token,
			scopes: scopes.map((scope) => scope.scope),
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
				scopes: {
					with: {
						scope: true,
					},
				},
			},
		});

		if (!res) return undefined;

		const { scopes, ...token } = res;

		return {
			...token,
			scopes: scopes.map((scope) => scope.scope),
		};
	}
}
