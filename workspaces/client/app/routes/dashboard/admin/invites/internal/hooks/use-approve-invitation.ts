import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useApproveInvitation = () => {
	const { userRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			await userRepository.approveInvitation(userId);
		},
		onSuccess: async () => {
			pushToast({
				title: "承認しました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: userRepository.getAllProvisionalUsers$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "承認できませんでした",
				description: "再度お試しください",
				type: "error",
			});
		},
	});
};
