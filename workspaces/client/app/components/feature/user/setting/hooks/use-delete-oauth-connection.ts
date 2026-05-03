import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useDeleteOAuthConnection = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (providerId: number) =>
			userRepository.deleteOAuthConnection(providerId),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "OAuth の連携を解除しました",
				description: "誤って解除した場合には再度連携してください。",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "OAuth の連携を解除できませんでした",
				description: "もう一度お試しください",
			});
		},
	});
};
