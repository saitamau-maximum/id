export interface InviteStructure {
	id: string;
	expiresAt: Date | null;
	remainingUse: number | null;
	createdAt: Date;
	issuedByUserId: string;
}

export type IssuerInfo = {
	id: string;
	displayId?: string;
	displayName?: string;
	profileImageURL?: string;
};

export type InviteWithUser = InviteStructure & {
	issuedBy: IssuerInfo;
};

export interface IInviteRepository {
	getAllInvites: () => Promise<InviteWithUser[]>;
	createInvite: (params: Omit<InviteStructure, "id">) => Promise<string>;
	getInviteById: (id: string) => Promise<InviteStructure>;
	reduceInviteUsage: (id: string) => Promise<void>;
	deleteInvite: (id: string) => Promise<void>;
}
