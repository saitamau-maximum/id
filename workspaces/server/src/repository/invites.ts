export interface IInvitesRepository {
	createInvite: (
		expiresAt: Date,
		remainingUse: number,
		createdAt: Date,
		issuedBy: string,
	) => Promise<void>;
	deleteInvite: (id: string) => Promise<void>;
}
