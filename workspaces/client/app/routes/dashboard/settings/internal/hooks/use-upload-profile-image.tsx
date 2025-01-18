import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

type UploadProfileImagePayload = {
	file: File;
};

type UseUploadProfileImage = {
	onSuccess: () => void;
};

export const useUploadProfileImage = ({
	onSuccess: onSettled,
}: UseUploadProfileImage) => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	return useMutation({
		mutationFn: (payload: UploadProfileImagePayload) =>
			userRepository.updateUserProfileImage(payload.file),
		onSuccess: () => {
			onSettled();
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
	});
};
