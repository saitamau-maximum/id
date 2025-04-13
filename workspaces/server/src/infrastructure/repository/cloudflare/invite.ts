import { eq, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IInviteRepository,
	InviteStructure,
	InviteWithUser,
} from "../../../repository/invite";

export class CloudflareInviteRepository implements IInviteRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getAllInvites(): Promise<InviteWithUser[]> {
		const res = await this.client.query.invites.findMany({
			with: {
				issuedBy: {
					with: {
						profile: true,
					},
				},
			},
		});

		return res.map((invite) => ({
			...invite,
			expiresAt: invite.expiresAt ? new Date(invite.expiresAt) : null,
			createdAt: new Date(invite.createdAt),
			issuedBy: {
				id: invite.issuedBy.id,
				displayName: invite.issuedBy.profile.displayName ?? undefined,
				displayId: invite.issuedBy.profile.displayId ?? undefined,
				profileImageURL: invite.issuedBy.profile.profileImageURL ?? undefined,
			},
		}));
	}

	async createInvite(params: Omit<InviteStructure, "id">) {
		const inviteId = crypto.randomUUID();
		await this.client.insert(schema.invites).values({
			id: inviteId,
			...params,
		});
		return inviteId;
	}

	async getInviteById(id: string): Promise<InviteStructure> {
		const res = await this.client.query.invites.findFirst({
			where: eq(schema.invites.id, id),
		});
		if (!res) {
			throw new Error(`Invite with ID ${id} not found`);
		}

		// 利用可能回数の検証
		if (res.remainingUse !== null && res.remainingUse <= 0) {
			throw new Error(`Invite with ID ${id} is no longer available`);
		}
		// 有効期限の検証
		if (res.expiresAt !== null && res.expiresAt < new Date()) {
			throw new Error(`Invite with ID ${id} has expired`);
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
