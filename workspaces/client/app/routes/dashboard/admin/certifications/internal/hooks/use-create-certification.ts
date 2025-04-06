import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CertificationCreateParams } from "~/repository/certification";

export const useCreateCertification = () => {
	const queryClient = useQueryClient();
	const { certificationRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: CertificationCreateParams) =>
			certificationRepository.createCertification(payload),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "資格・試験を追加しました",
			});
			queryClient.invalidateQueries({
				queryKey: certificationRepository.getAllCertifications$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "資格・試験を追加できませんでした",
				description: "もう一度お試しください",
			});
		},
	});
};
