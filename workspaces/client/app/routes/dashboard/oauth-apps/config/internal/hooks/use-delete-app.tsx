import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export function useDeleteApp({ appId }: { appId: string }) {
	const navigate = useNavigate();
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => oauthAppsRepository.deleteApp(appId),
		onSuccess: () => {
			navigate("/oauth-apps");
			pushToast({
				type: "success",
				title: "アプリケーションを削除しました",
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
