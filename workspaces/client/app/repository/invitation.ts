import type { Invitation } from "~/types/invitation";
import { client } from "~/utils/hono";

interface GenerateInvitationOptions {
	expiresAt: Date | null;
	remainingUse: number | null;
}

export interface IInvitationRepository {
	getInvitations: () => Promise<Invitation[]>;
	getInvitations$$key: () => unknown[];
	generateInvitation: ({
		expiresAt,
		remainingUse,
	}: GenerateInvitationOptions) => Promise<string>;
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
		expiresAt,
		remainingUse,
	}: GenerateInvitationOptions): Promise<string> {
		const res = await client.invite.$post({
			json: {
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
}
