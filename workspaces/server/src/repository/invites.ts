export interface InviteStructure {
	id: string;
	expiresAt: Date | null;
	remainingUse: number | null;
	createdAt: Date;
	issuedBy: string;
}

export interface IInvitesRepository {
	createInvite: (
		params: Omit<InviteStructure, "id">
	) => Promise<void>;
	getInviteById: (id: string) => Promise<InviteStructure>;
	reduceInviteUsage: (id: string) => Promise<void>;
	deleteInvite: (id: string) => Promise<void>;
}
