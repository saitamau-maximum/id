import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useUpdateProfileImage = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (file: File) => userRepository.updateUserProfileImage(file),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "プロフィール画像を更新しました",
				to: "/",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "プロフィール画像の更新に失敗しました",
				description:
					"プロフィール画像のサイズが5MiBを超えている可能性があります",
			});
		},
	});
};
