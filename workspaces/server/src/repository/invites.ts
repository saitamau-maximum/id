export interface IInvitesRepository {
	createOneTimeToken: (
		expiresAt: Date,
		remainingUse: number,
		createdAt: Date,
		issuedBy: string,
		Token: string,
	) => Promise<void>;
	deleteOneTimeToken: (id: string) => Promise<void>;
}
