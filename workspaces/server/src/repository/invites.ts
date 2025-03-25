export interface InviteSchema {
	id: string;
	expiresAt: Date | null;
	remainingUse: number | null;
	createdAt: Date;
	issuedBy: string;
}

export interface IInvitesRepository {
	createInvite: (
		expiresAt: Date | null,
		remainingUse: number | null,
		createdAt: Date,
		issuedBy: string,
	) => Promise<void>;
	getInviteById: (id: string) => Promise<InviteSchema>;
	reduceInviteUsage: (id: string) => Promise<void>;
	deleteInvite: (id: string) => Promise<void>;
}
