import type { CertificationUpdateParams } from "@idp/schema/api/certification";
import type { Certification } from "@idp/schema/entity/certification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useUpdateCertification = () => {
	const queryClient = useQueryClient();
	const { certificationRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: Certification["id"];
			params: CertificationUpdateParams;
		}) => certificationRepository.updateCertification(id, params),
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
