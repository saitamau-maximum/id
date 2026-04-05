import type { Invite, InviteWithIssuer } from "@idp/schema/entity/invite";

export type CreateInviteParams = Omit<Invite, "id" | "createdAt">;

export interface IInviteRepository {
	getAllInvites: () => Promise<InviteWithIssuer[]>;
	createInvite: (params: CreateInviteParams) => Promise<string>;
	getInviteById: (id: string) => Promise<Invite>;
	reduceInviteUsage: (id: string) => Promise<void>;
	deleteInvite: (id: string) => Promise<void>;
}
