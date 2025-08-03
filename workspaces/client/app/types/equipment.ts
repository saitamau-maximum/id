export interface Equipment {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
}

export interface EquipmentWithOwner extends Equipment {
	owner: {
		id: string;
		displayId?: string;
		displayName?: string;
		profileImageURL?: string;
	};
}
