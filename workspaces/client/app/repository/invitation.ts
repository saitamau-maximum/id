import type { Invitation } from "~/types/invitation";
import { client } from "~/utils/hono";

export interface IInvitationRepository {
	getInvitations: () => Promise<Invitation[]>;
	getInvitations$$key: () => unknown[];
}

export class InvitationRepositoryImpl implements IInvitationRepository {
	async getInvitations(): Promise<Invitation[]> {
		const res = await client.invite.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch apps");
		}
		// return res.json();
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
}
