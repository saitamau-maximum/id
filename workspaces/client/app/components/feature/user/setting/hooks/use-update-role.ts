import type { RoleId } from "@idp/schema/entity/role";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useUpdateRole = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: RoleId[]) =>
			userRepository.selfUpdateUserRole(payload),
		onSuccess: () => {
			pushToast({
				title: "ロールを更新しました",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "ロールの更新に失敗しました",
			});
		},
	});
};
