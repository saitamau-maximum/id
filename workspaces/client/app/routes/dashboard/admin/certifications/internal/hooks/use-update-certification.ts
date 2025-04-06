import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CertificationUpdateParams } from "~/repository/certification";

export const useUpdateCertification = () => {
	const queryClient = useQueryClient();
	const { certificationRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (params: CertificationUpdateParams) =>
			certificationRepository.updateCertification(params),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "資格・試験を更新しました",
			});
			queryClient.invalidateQueries({
				queryKey: certificationRepository.getAllCertifications$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "資格・試験を更新できませんでした",
				description: "もう一度お試しください",
			});
		},
	});
};
