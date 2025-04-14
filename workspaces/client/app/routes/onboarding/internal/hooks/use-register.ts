import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { UserRegisterParams } from "~/repository/user";

export const useRegister = () => {
	const queryClient = useQueryClient();
	const { userRepository, authRepository } = useRepository();
	const { refetch } = useAuth();
	const { pushToast } = useToast();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: UserRegisterParams) =>
			userRepository.register(payload),
		onSuccess: async () => {
			pushToast({
				type: "success",
				title: "初期登録が完了しました",
				description: "ようこそ、Maximumへ！",
			});

			// どうせ refetch で cache を更新される？ので、invalidate しなくても良い？
			await queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
			const { data } = await refetch();

			if (!data) throw new Error("Failed to refetch user data");
			if (data.isProvisional) {
				// 仮登録ユーザーなら入金してね！画面に行く
				navigate("/payment-info");
			} else {
				navigate("/");
			}
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
