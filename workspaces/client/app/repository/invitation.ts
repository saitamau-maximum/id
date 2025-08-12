import type { Invitation } from "~/types/invitation";
import { client } from "~/utils/hono";

export interface GenerateInvitationOptions {
	title: string;
	expiresAt: Date | null;
	remainingUse: number | null;
}

export interface FetchInvitationParams {
	invitationId: string;
}

export interface IInvitationRepository {
	getInvitations: () => Promise<Invitation[]>;
	getInvitations$$key: () => unknown[];
	generateInvitation: ({
		title,
		expiresAt,
		remainingUse,
	}: GenerateInvitationOptions) => Promise<string>;
	fetchInvitation: (params: FetchInvitationParams) => Promise<boolean>;
	fetchInvitation$$key: (invitationId: string) => unknown[];
	deleteInvitation: (id: string) => Promise<void>;
}

export class InvitationRepositoryImpl implements IInvitationRepository {
	async getInvitations(): Promise<Invitation[]> {
		const res = await client.invite.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch apps");
		}
		const data = await res.json();
		return data.map((invitation) => ({
			...invitation,
			expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt) : null,
			createdAt: new Date(invitation.createdAt),
		}));
	}

	getInvitations$$key() {
		return ["apps"];
	}

	async generateInvitation({
		title,
		expiresAt,
		remainingUse,
	}: GenerateInvitationOptions): Promise<string> {
		const res = await client.invite.$post({
			json: {
				title,
				expiresAt: expiresAt?.toISOString(),
				remainingUse: remainingUse ?? undefined,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to fetch apps");
		}
		const data = await res.json();
		return data.id;
	}

	async fetchInvitation(params: FetchInvitationParams): Promise<boolean> {
		const res = await client.invite[":id"].$get({
			param: {
				id: params.invitationId,
			},
		});
		return res.ok;
	}

	fetchInvitation$$key(invitationId: string): unknown[] {
		return ["invitation", invitationId];
	}

	async deleteInvitation(id: string): Promise<void> {
		const res = await client.invite[":id"].$delete({
			param: {
				id,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete invitation");
		}
	}
}
