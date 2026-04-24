import type {
	Equipment,
	EquipmentWithOwner,
} from "@idp/schema/entity/equipment";

export type CreateEquipmentParams = Omit<Equipment, "id">;
export type UpdateEquipmentParams = Omit<Equipment, "createdAt">;

export interface IEquipmentRepository {
	createEquipment: (params: CreateEquipmentParams) => Promise<string>;
	getEquipmentById: (id: string) => Promise<EquipmentWithOwner>;
	getAllEquipments: () => Promise<EquipmentWithOwner[]>;
	updateEquipment: (params: UpdateEquipmentParams) => Promise<void>;
	deleteEquipment: (id: string) => Promise<void>;
}
