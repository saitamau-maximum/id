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
		// その招待リンクで招待された仮登録ユーザーが存在するなら、削除できないようにする
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.invitationId, id),
		});
		if (user) {
			throw new Error(
				`Cannot delete invite with ID ${id} because it has associated users.`,
			);
		}

		await this.client
			.delete(schema.invites)
			.where(eq(schema.invites.id, id))
			.execute();
	}
}
