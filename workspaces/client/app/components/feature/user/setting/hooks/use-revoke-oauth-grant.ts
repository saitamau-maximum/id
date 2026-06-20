import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useRevokeOAuthGrant = () => {
	const queryClient = useQueryClient();
	const { userRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (clientId: string) => userRepository.revokeOAuthGrant(clientId),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "承認済みアプリを解除しました",
				description: "必要になった場合は、次回利用時に再度承認してください。",
			});
			queryClient.invalidateQueries({
				queryKey: userRepository.getOAuthGrants$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "承認済みアプリを解除できませんでした",
				description: "もう一度お試しください",
			});
		},
	});
};
