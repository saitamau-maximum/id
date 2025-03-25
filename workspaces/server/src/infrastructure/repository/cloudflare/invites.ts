import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { IInvitesRepository } from "../../../repository/invites";

export class CloudflareInvitesRepository implements IInvitesRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createOneTimeToken(
		expiresAt: Date,
		remainingUse: number,
		createdAt: Date,
		issuedBy: string,
		token: string,
	) {
		await this.client.insert(schema.invites).values({
			id: crypto.randomUUID(),
			expiresAt,
			remainingUse,
			createdAt,
			issuedBy,
			token,
		});
	}

	async deleteOneTimeToken(id: string) {
		await this.client
			.delete(schema.invites)
			.where(eq(schema.invites.id, id))
			.execute();
	}
}
