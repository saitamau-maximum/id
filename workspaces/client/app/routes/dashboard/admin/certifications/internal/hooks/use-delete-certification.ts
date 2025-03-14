import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useDeleteCertification = () => {
	const queryClient = useQueryClient();
	const { certificationRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (certificationId: string) =>
			certificationRepository.deleteCertification(certificationId),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "資格・試験を削除しました",
			});
			queryClient.invalidateQueries({
				queryKey: certificationRepository.getAllCertifications$$key(),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "資格・試験を削除できませんでした",
				description: "もう一度お試しください",
			});
		},
	});
};
