import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

type UploadProfilePayload = {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail: string;
	email: string;
	studentId: string;
	grade: string;
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: UploadProfilePayload) =>
			userRepository.update(payload),
		onSuccess: () => {
			pushToast({
				type: "info",
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
