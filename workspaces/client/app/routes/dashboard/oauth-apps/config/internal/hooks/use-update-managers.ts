import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

interface IMutationParams {
	managerUserIds: string[];
}

export function useUpdateManagers({ id }: { id: string }) {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: IMutationParams) =>
			oauthAppsRepository.updateManagers(id, payload.managerUserIds),
		onSuccess: () => {
			pushToast({
				type: "success",
				title: "マネージャーの更新に成功しました",
			});
			queryClient.invalidateQueries({
				queryKey: oauthAppsRepository.getAppById$$key(id),
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "マネージャーの更新に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
}
