import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

interface IMutationParams {
	secretHash: string;
}

export function useDeleteSecret({ appId }: { appId: string }) {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: IMutationParams) =>
			oauthAppsRepository.deleteSecret(appId, payload.secretHash),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "シークレットを削除しました",
			});
			queryClient.invalidateQueries({
				queryKey: oauthAppsRepository.getAppById$$key(appId),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "削除に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
}
