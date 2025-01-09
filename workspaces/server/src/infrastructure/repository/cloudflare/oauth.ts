import { type InferInsertModel, and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IOauthRepository,
	Scope,
} from "./../../../usecase/repository/oauth";

export class CloudflareOauthRepository implements IOauthRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getClientById(clientId: string) {
		const res = await this.client.query.oauthClient.findFirst({
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
		// transaction が使えないが、 batch だと autoincrement な token id を取得できないので、 Cloudflare の力を信じてふつうに insert する
		const tokenInsertRes = await this.client
			.insert(schema.oauthToken)
			.values({
				clientId,
				userId,
				code,
				codeExpiresAt: new Date(Date.now() + 1 * 60 * 1000), // 1 min
				codeUsed: false,
				redirectUri,
				accessToken,
				accessTokenExpiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
			})
			.returning();

		if (tokenInsertRes.length === 0) {
			return { success: false as const, message: "Failed to insert token" };
		}

		const tokenScopeInsertRes = await this.client
			.insert(schema.oauthTokenScope)
			.values(
				scopes.map((scope) => ({
					tokenId: tokenInsertRes[0].id,
					scopeId: scope.id,
				})),
			);

		if (!tokenScopeInsertRes.success) {
			return {
				success: false as const,
				message: "Failed to insert token scope",
			};
		}

		return { success: true as const };
	}

	async getTokenByCode(code: string) {
		const res = await this.client.query.oauthToken.findFirst({
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
				.delete(schema.oauthTokenScope)
				.where(eq(schema.oauthTokenScope.tokenId, tokenId)),
			// token を削除
			this.client
				.delete(schema.oauthToken)
				.where(eq(schema.oauthToken.id, tokenId)),
		]);
		return res.every((r) => r.success);
	}

	async setCodeUsed(code: string) {
		const res = await this.client
			.update(schema.oauthToken)
			.set({ codeUsed: true })
			.where(eq(schema.oauthToken.code, code));
		return res.success;
	}

	async getTokenByAccessToken(accessToken: string) {
		const res = await this.client.query.oauthToken.findFirst({
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
