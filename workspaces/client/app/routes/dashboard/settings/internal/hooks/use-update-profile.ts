import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { ProfileUpdateParams } from "~/repository/user";

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: ProfileUpdateParams) =>
			userRepository.update(payload),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "プロフィールを更新しました",
				to: "/",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "プロフィールの更新に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
};
