import { eq, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IInvitesRepository,
	InviteStructure,
} from "../../../repository/invites";

export class CloudflareInvitesRepository implements IInvitesRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createInvite(params: Omit<InviteStructure, "id">) {
		await this.client.insert(schema.invites).values({
			id: crypto.randomUUID(),
			...params,
		});
	}

	async getInviteById(id: string): Promise<InviteStructure> {
		// 指定したIDの招待コードを取得
		const res = await this.client.query.invites.findFirst({
			where: eq(schema.invites.id, id),
		});
		if (!res) {
			throw new Error(`Invite with ID ${id} not found`);
		}
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
