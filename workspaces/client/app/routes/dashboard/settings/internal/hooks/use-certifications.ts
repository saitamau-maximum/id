import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useCertifications = () => {
	const { certificationRepository } = useRepository();
	return useQuery({
		queryKey: certificationRepository.getAllCertifications$$key(),
		queryFn: certificationRepository.getAllCertifications,
	});
};

export const useDeleteUserCertification = () => {
	const queryClient = useQueryClient();
	const { certificationRepository, authRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (certificationId: string) =>
			certificationRepository.deleteUserCertification(certificationId),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "資格・試験を削除しました",
				description: "誤って削除した場合には再申請してください。",
			});
			queryClient.invalidateQueries({
				queryKey: authRepository.me$$key(),
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
