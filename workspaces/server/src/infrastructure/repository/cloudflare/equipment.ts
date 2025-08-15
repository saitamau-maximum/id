import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	Equipment,
	EquipmentWithOwner,
	IEquipmentRepository,
} from "../../../repository/equipment";

export class CloudflareEquipmentRepository implements IEquipmentRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createEquipment(params: Omit<Equipment, "id">): Promise<string> {
		const id = crypto.randomUUID();
		await this.client.insert(schema.equipments).values({
			id,
			...params,
			description: params.description ?? null,
		});
		return id;
	}

	async getEquipmentById(id: string): Promise<EquipmentWithOwner> {
		const result = await this.client.query.equipments.findFirst({
			where: eq(schema.equipments.id, id),
			with: {
				owner: {
					with: {
						profile: {
							columns: {
								displayName: true,
								displayId: true,
								profileImageURL: true,
							},
						},
					},
				},
			},
		});

		if (!result) {
			throw new Error("Equipment not found");
		}

		return {
			id: result.id,
			name: result.name,
			description: result.description ?? undefined,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
			ownerId: result.ownerId,
			owner: {
				id: result.owner.id,
				displayName: result.owner.profile.displayName ?? "Unknown",
				displayId: result.owner.profile.displayId ?? undefined,
				profileImageURL: result.owner.profile.profileImageURL ?? undefined,
			},
		};
	}

	async getAllEquipments(): Promise<EquipmentWithOwner[]> {
		const results = await this.client.query.equipments.findMany({
			with: {
				owner: {
					with: {
						profile: {
							columns: {
								displayName: true,
								displayId: true,
								profileImageURL: true,
							},
						},
					},
				},
			},
			orderBy: (equipments, { desc }) => [desc(equipments.createdAt)],
		});

		return results.map((result) => ({
			id: result.id,
			name: result.name,
			description: result.description ?? undefined,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
			ownerId: result.ownerId,
			owner: {
				id: result.owner.id,
				displayName: result.owner.profile.displayName ?? "Unknown",
				displayId: result.owner.profile.displayId ?? undefined,
				profileImageURL: result.owner.profile.profileImageURL ?? undefined,
			},
		}));
	}

	async updateEquipment(params: Omit<Equipment, "createdAt">): Promise<void> {
		await this.client
			.update(schema.equipments)
			.set({
				name: params.name,
				description: params.description ?? null,
				ownerId: params.ownerId,
				updatedAt: params.updatedAt,
			})
			.where(eq(schema.equipments.id, params.id));
	}

	async deleteEquipment(id: string): Promise<void> {
		await this.client
			.delete(schema.equipments)
			.where(eq(schema.equipments.id, id));
	}
}
