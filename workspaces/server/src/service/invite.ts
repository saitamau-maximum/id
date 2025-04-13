import type { IInviteRepository } from "../repository/invite";

export const validateInvitation = async (
	inviteRepository: IInviteRepository,
	invitationId: string,
): Promise<void> => {
	const invitation = await inviteRepository.getInviteById(invitationId);

	// 利用可能回数の検証
	if (invitation.remainingUse !== null && invitation.remainingUse <= 0) {
		throw new Error(`Invite with ID ${invitationId} is no longer available`);
	}

	// 有効期限の検証
	if (invitation.expiresAt !== null && invitation.expiresAt < new Date()) {
		throw new Error(`Invite with ID ${invitationId} has expired`);
	}
};
