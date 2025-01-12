import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IOAuthRepository,
	OAuthConnection,
	Scope,
} from "./../../../repository/oauth";

export class CloudflareOAuthRepository implements IOAuthRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getClientById(clientId: string) {
		const res = await this.client.query.oauthClients.findFirst({
			where: (client, { eq }) => eq(client.id, clientId),
			with: {
				callbacks: true,
				scopes: {
					with: {
						scope: true,
					},
				},
			},
		});

		if (!res) return undefined;

		const { callbacks, scopes, ...client } = res;

		return {
			...client,
			callbackUrls: callbacks.map((callback) => callback.callbackUrl),
			scopes: scopes.map((clientScope) => clientScope.scope),
		};
	}

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

	async fetchOAuthConnectionsByUserId(
		userId: string,
	): Promise<OAuthConnection[]> {
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
			with: {
				profile: true,
				oauthConnections: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return user.oauthConnections;
	}
	async fetchOAuthConnectionsByUserDisplayId(
		displayId: string,
	): Promise<OAuthConnection[]> {
		const userProfile = await this.client.query.userProfiles.findFirst({
			where: eq(schema.userProfiles.displayId, displayId),
			with: {
				oauthConnections: true,
			},
		});

		if (!userProfile) {
			throw new Error("User not found");
		}

		return userProfile.oauthConnections;
	}
}
