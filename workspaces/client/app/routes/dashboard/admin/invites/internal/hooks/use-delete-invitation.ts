import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useDeleteInvititation = () => {
	const { invitationRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			invitationRepository.deleteInvitation(invitationId),
		onSuccess: () => {
			pushToast({
				title: "招待リンクを削除しました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: invitationRepository.getInvitations$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "招待リンクの削除に失敗しました",
				description:
					"その招待リンクを使用した仮登録ユーザーが存在する可能性があります",
				type: "error",
			});
		},
	});
};
