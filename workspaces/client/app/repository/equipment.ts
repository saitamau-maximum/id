import type {
	CreateOrUpdateEquipmentParams,
	GetEquipmentByIdResponse,
	GetEquipmentsResponse,
} from "@idp/schema/api/equipment";
import type { Equipment } from "@idp/schema/entity/equipment";
import { client } from "~/utils/hono";

export interface IEquipmentRepository {
	getAllEquipments: () => Promise<GetEquipmentsResponse>;
	getAllEquipments$$key: () => unknown[];
	getEquipmentById: (
		equipmentId: Equipment["id"],
	) => Promise<GetEquipmentByIdResponse>;
	getEquipmentById$$key: (equipmentId: Equipment["id"]) => unknown[];
	createEquipment: (params: CreateOrUpdateEquipmentParams) => Promise<void>;
	updateEquipment: (
		equipmentId: Equipment["id"],
		params: CreateOrUpdateEquipmentParams,
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

	async createEquipment(params: CreateOrUpdateEquipmentParams) {
		const res = await client.equipment.$post({
			json: {
				name: params.name,
				description: params.description?.trim(),
				ownerId: params.ownerId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create equipment");
		}
	}

	async updateEquipment(
		equipmentId: Equipment["id"],
		params: CreateOrUpdateEquipmentParams,
	) {
		const res = await client.equipment[":id"].$put({
			param: {
				id: equipmentId,
			},
			json: {
				name: params.name,
				description: params.description?.trim(),
				ownerId: params.ownerId,
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
