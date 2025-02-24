import { useMutation } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { IRegisterAppParams } from "~/repository/oauth-apps";

export function useRegisterOAuthApp() {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: IRegisterAppParams) =>
			oauthAppsRepository.registerApp(payload),
		onSuccess: (data) => {
			pushToast({
				type: "success",
				title: `OAuth アプリケーション「${data.title}」の登録が完了しました`,
				description: data.description,
			});
		},
		onError: () => {
			pushToast({
				type: "error",
				title: "OAuth アプリケーションの登録に失敗しました",
				description: "もう一度お試しください",
			});
		},
	});
}
