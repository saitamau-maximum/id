import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InformationDialog } from "~/components/logic/callable/information";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import { GeneratedSecretDisplay } from "../components/generated-secret-display";

export function useGenerateSecret({ appId }: { appId: string }) {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => oauthAppsRepository.generateSecret(appId),
		onSuccess: async (data) => {
			pushToast({
				type: "success",
				title: "シークレットを追加しました",
			});
			queryClient.invalidateQueries({
				queryKey: oauthAppsRepository.getAppById$$key(appId),
			});
			await InformationDialog.call({
				title: "新しいシークレットを追加しました",
				children: <GeneratedSecretDisplay secret={data.secret} />,
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "シークレットの追加に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
}
