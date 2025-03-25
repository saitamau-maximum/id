import { eq, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { IInvitesRepository, InviteSchema } from "../../../repository/invites";

export class CloudflareInvitesRepository implements IInvitesRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createInvite(
		expiresAt: Date | null,
		remainingUse: number | null,
		createdAt: Date,
		issuedBy: string,
	) {
		await this.client.insert(schema.invites).values({
			id: crypto.randomUUID(),
			expiresAt,
			remainingUse,
			createdAt,
			issuedBy,
		});
	}

	async getInviteById(id: string): Promise<InviteSchema> {
		// 指定したIDの招待コードを取得
		const res = await this.client
			.select()
			.from(schema.invites)
			.where(eq(schema.invites.id, id))
			.limit(1)
			.execute()
			.then(rows => rows[0]);
		console.log(res);
		return res;
	}

	async reduceInviteUsage(id: string) {
		await this.client
			.update(schema.invites)
			.set({
				remainingUse: sql`${schema.invites.remainingUse} - 1`,
			})
			.where(eq(schema.invites.id, id))
			.execute();
	}

	async deleteInvite(id: string) {
		await this.client
			.delete(schema.invites)
			.where(eq(schema.invites.id, id))
			.execute();
	}
}
