export interface IInvitesRepository {
	createOneTimeToken: (
		expiresAt: Date,
		remainingUse: number,
		createdAt: Date,
		issuedBy: string,
	) => Promise<void>;
	deleteOneTimeToken: (id: string) => Promise<void>;
}
