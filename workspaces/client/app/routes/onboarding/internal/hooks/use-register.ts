import { useMutation } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { UserRegisterParams } from "~/repository/user";

interface Props {
	onSuccess?: (v: UserRegisterParams) => void;
}

export const useRegister = ({ onSuccess }: Props) => {
	const { userRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: UserRegisterParams) =>
			userRepository.register(payload),
		onSuccess: (_, v) => {
			pushToast({
				type: "success",
				title: "初期登録が完了しました",
				description: "ようこそ、Maximumへ！",
			});
			onSuccess?.(v);
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
