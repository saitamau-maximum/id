import type { OAuthAppRegisterParams } from "@idp/schema/api/oauth/manage";
import { useMutation } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export function useUpdateOAuthApp({ id }: { id: string }) {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: async (payload: OAuthAppRegisterParams) => {
			await oauthAppsRepository.updateApp(id, payload);

			return {
				title: payload.name,
				description: payload.description,
			};
		},
		onSuccess: (data) => {
			pushToast({
				type: "success",
				title: `${data.title} の更新に成功しました`,
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "OAuth アプリケーションの更新に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
}
