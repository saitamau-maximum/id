import { type InferInsertModel, and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { IOauthRepository } from "./../../../usecase/repository/oauth";

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
}
