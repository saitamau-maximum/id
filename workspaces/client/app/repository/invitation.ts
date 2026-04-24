import type {
	GetInvitesResponse,
	InviteCreateParams,
} from "@idp/schema/api/invite";
import { client } from "~/utils/hono";

export interface IInvitationRepository {
	getInvitations: () => Promise<GetInvitesResponse>;
	getInvitations$$key: () => unknown[];
	generateInvitation: ({
		title,
		expiresAt,
		remainingUse,
	}: InviteCreateParams) => Promise<string>;
	existsInvitation: (invitationId: string) => Promise<boolean>;
	existsInvitation$$key: (invitationId: string) => unknown[];
	deleteInvitation: (invitationId: string) => Promise<void>;
}

export class InvitationRepositoryImpl implements IInvitationRepository {
	async getInvitations(): Promise<GetInvitesResponse> {
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
	}: InviteCreateParams): Promise<string> {
		const res = await client.invite.$post({
			json: {
				title,
				expiresAt: expiresAt?.toISOString(),
				remainingUse,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to fetch apps");
		}
		const data = await res.json();
		return data.id;
	}

	async existsInvitation(invitationId: string): Promise<boolean> {
		const res = await client.invite[":id"].$get({
			param: {
				id: invitationId,
			},
		});
		return res.ok;
	}

	existsInvitation$$key(invitationId: string): unknown[] {
		return ["invitation", invitationId];
	}

	async deleteInvitation(invitationId: string): Promise<void> {
		const res = await client.invite[":id"].$delete({
			param: {
				id: invitationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete invitation");
		}
	}
}
