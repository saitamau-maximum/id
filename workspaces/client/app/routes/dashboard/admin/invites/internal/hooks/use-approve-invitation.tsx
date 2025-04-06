import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useApprove = () => {
	const { userRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			await userRepository.approveInvitation(userId);
		},
		onSuccess: async () => {
			pushToast({
				title: "承認に成功しました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: userRepository.getAllPendingUsers$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "承認に失敗しました",
				type: "error",
			});
		},
	});
};
