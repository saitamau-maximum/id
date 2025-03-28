import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InformationDialog } from "~/components/logic/callable/information";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import { GeneratedInvitationURLDisplay } from "../components/generated-invitation-url-display";

export const useGenerateInvitation = () => {
	const { invitationRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: invitationRepository.generateInvitation,
		onSuccess: async (id) => {
			pushToast({
				title: "招待リンクをしました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: invitationRepository.getInvitations$$key(),
			});
			await InformationDialog.call({
				title: "招待リンクの生成に成功しました",
				children: (
					<GeneratedInvitationURLDisplay
						invitationURL={`${window.location.origin}/invitation/${id}`}
					/>
				),
			});
		},
		onError: () => {
			pushToast({
				title: "招待リンクの生成に失敗しました",
				type: "error",
			});
		},
	});
};
