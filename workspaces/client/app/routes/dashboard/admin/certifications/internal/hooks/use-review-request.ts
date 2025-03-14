import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CertificationRequestReviewParams } from "~/repository/certification";

export const useReviewRequest = () => {
	const queryClient = useQueryClient();
	const { certificationRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: CertificationRequestReviewParams) =>
			certificationRepository.reviewCertificationRequest(payload),
		onSuccess: (_, payload) => {
			pushToast({
				type: "success",
				title: `リクエストを${payload.isApproved ? "承認" : "却下"}しました`,
				description: "もし間違えた場合、再申請してもらってください",
			});
			queryClient.invalidateQueries({
				queryKey: certificationRepository.getAllCertificationRequests$$key(),
			});
		},
		onError: (_, payload) => {
			pushToast({
				type: "error",
				title: `リクエストを${payload.isApproved ? "承認" : "却下"}しました`,
				description: "もう一度お試しください",
			});
		},
	});
};
