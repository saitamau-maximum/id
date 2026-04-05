import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useCheckInvitation = (invitationId?: string) => {
	const { invitationRepository } = useRepository();
	return useQuery({
		enabled: invitationId !== undefined,
		queryKey: invitationRepository.existsInvitation$$key(invitationId ?? ""),
		queryFn: () => {
			// undefined の場合は実行されないはずだが型安全のためにチェック
			if (!invitationId) throw new Error("invitationId is required");
			return invitationRepository.existsInvitation(invitationId);
		},
	});
};
