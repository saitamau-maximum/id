import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useConfirmPayment = (userId: string) => {
	const queryClient = useQueryClient();
	const { userRepository } = useRepository();
	return useMutation({
		mutationFn: () => userRepository.confirmPayment(userId),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: userRepository.getAllUsers$$key(),
			});
		},
	});
};
