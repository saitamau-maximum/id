import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { UserRegisterParams } from "~/repository/user";

export const useRegister = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { pushToast } = useToast();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: UserRegisterParams) =>
			userRepository.register(payload),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "初期登録が完了しました",
				description: "ようこそ、Maximumへ！",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
			navigate("/");
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "初期登録に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
};
