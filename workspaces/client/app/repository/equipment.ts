import type { Equipment, EquipmentWithOwner } from "~/types/equipment";
import { client } from "~/utils/hono";

export interface EquipmentCreateParams {
	name: string;
	description?: string;
	ownerId: string;
}

export interface EquipmentUpdateParams {
	id: string;
	name: string;
	description?: string;
	ownerId: string;
	updatedAt: Date;
}

export interface IEquipmentRepository {
	getAllEquipments: () => Promise<EquipmentWithOwner[]>;
	getAllEquipments$$key: () => unknown[];
	getEquipmentById: (
		equipmentId: Equipment["id"],
	) => Promise<EquipmentWithOwner>;
	getEquipmentById$$key: (equipmentId: Equipment["id"]) => unknown[];
	createEquipment: (
		equipment: Pick<Equipment, "name" | "description" | "ownerId">,
	) => Promise<void>;
	updateEquipment: (
		equipment: Pick<
			Equipment,
			"id" | "name" | "description" | "ownerId" | "updatedAt"
		>,
	) => Promise<void>;
	deleteEquipment: (equipmentId: Equipment["id"]) => Promise<void>;
}

export class EquipmentRepositoryImpl implements IEquipmentRepository {
	async getAllEquipments() {
		const res = await client.equipment.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch equipments");
		}
		return (await res.json()).map((equipment) => ({
			...equipment,
			createdAt: new Date(equipment.createdAt),
			updatedAt: new Date(equipment.updatedAt),
		}));
	}

	getAllEquipments$$key() {
		return ["equipments"];
	}

	async getEquipmentById(equipmentId: Equipment["id"]) {
		const res = await client.equipment[":id"].$get({
			param: {
				id: equipmentId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to fetch equipment");
		}
		const equipment = await res.json();
		return {
			...equipment,
			createdAt: new Date(equipment.createdAt),
			updatedAt: new Date(equipment.updatedAt),
		};
	}

	getEquipmentById$$key(equipmentId: Equipment["id"]) {
		return ["equipments", equipmentId];
	}

	async createEquipment(equipment: {
		name: string;
		description?: string;
		ownerId: string;
	}) {
		const res = await client.equipment.$post({
			json: {
				name: equipment.name,
				description: equipment.description ?? null,
				ownerId: equipment.ownerId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create equipment");
		}
	}

	async updateEquipment(equipment: {
		id: string;
		name: string;
		description?: string;
		ownerId: string;
		updatedAt: Date;
	}) {
		const res = await client.equipment[":id"].$put({
			param: {
				id: equipment.id,
			},
			json: {
				name: equipment.name,
				description: equipment.description ?? undefined,
				ownerId: equipment.ownerId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update equipment");
		}
	}

	async deleteEquipment(equipmentId: Equipment["id"]) {
		const res = await client.equipment[":id"].$delete({
			param: {
				id: equipmentId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete equipment");
		}
	}
}
