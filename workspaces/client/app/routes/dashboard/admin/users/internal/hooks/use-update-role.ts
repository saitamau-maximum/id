import type { Role } from "@idp/schema/entity/role";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";

type UpdateRolePayload = {
	roleIds: Role["id"][];
};

export const useUpdateRole = (userId: string) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	return useMutation({
		mutationFn: (payload: UpdateRolePayload) =>
			userRepository.updateUserRole(userId, payload.roleIds),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: userRepository.getAllUsers$$key(),
			});

			if (user?.id === userId) {
				// もし更新対象が自分自身だった場合、meのクエリも更新する
				queryClient.invalidateQueries({
					queryKey: authRepository.me$$key(),
				});
			}
		},
	});
};
