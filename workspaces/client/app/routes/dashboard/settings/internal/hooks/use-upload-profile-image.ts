import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

type UploadProfileImagePayload = {
	file: File;
};

type UseUploadProfileImage = {
	onSuccess: () => void;
};

export const useUploadProfileImage = ({ onSuccess }: UseUploadProfileImage) => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: UploadProfileImagePayload) =>
			userRepository.updateUserProfileImage(payload.file),
		onSuccess: () => {
			pushToast({
				type: "info",
				title: "プロフィール画像を更新しました",
				to: "/",
			});
			onSuccess();
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
	});
};
