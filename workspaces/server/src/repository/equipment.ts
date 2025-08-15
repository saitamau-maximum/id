export type Equipment = {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
};

export type EquipmentWithOwner = Equipment & {
	owner: {
		id: string;
		displayName: string;
		displayId?: string;
		profileImageURL?: string;
	};
};

export interface IEquipmentRepository {
	createEquipment: (params: Omit<Equipment, "id">) => Promise<string>;
	getEquipmentById: (id: string) => Promise<EquipmentWithOwner>;
	getAllEquipments: () => Promise<EquipmentWithOwner[]>;
	updateEquipment: (params: Omit<Equipment, "createdAt">) => Promise<void>;
	deleteEquipment: (id: string) => Promise<void>;
}
