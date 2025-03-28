export interface Invitation {
	id: string;
	expiresAt: Date | null;
	remainingUse: number | null;
	createdAt: Date;
	issuedBy: {
		id: string;
		displayId?: string;
		displayName?: string;
		profileImageURL?: string;
	};
}
