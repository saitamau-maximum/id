import type { InviteCreateParams } from "@idp/schema/api/invite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InformationDialog } from "~/components/logic/callable/information";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import { InvitationURLDisplay } from "../components/invitation-url-display";

export const useGenerateInvitation = () => {
	const { invitationRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: InviteCreateParams) => {
			const id = await invitationRepository.generateInvitation(params);
			return {
				id,
				...params,
			};
		},
		onSuccess: async (data) => {
			pushToast({
				title: "招待リンクを生成しました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: invitationRepository.getInvitations$$key(),
			});
			await InformationDialog.call({
				title: "招待リンク",
				children: <InvitationURLDisplay title={data.title} id={data.id} />,
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
