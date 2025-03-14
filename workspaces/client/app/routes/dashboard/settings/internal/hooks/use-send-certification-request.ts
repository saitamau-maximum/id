import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CertificationRequestParams } from "~/repository/certification";

export const useSendCertificationRequest = () => {
	const queryClient = useQueryClient();
	const { certificationRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: CertificationRequestParams) =>
			certificationRepository.requestCertification(payload),
		onSuccess: () => {
			pushToast({
				title: "資格・試験の情報を申請しました",
				description:
					"承認されるまでに時間がかかる場合があります。 急ぎなら Admin に連絡してください。",
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "資格・試験の情報の申請に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
};
