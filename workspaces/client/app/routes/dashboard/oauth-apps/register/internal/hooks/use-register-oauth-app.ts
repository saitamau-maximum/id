import type { OAuthAppRegisterParams } from "@idp/schema/api/oauth/manage";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export function useRegisterOAuthApp() {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (payload: OAuthAppRegisterParams) => {
			await oauthAppsRepository.registerApp(payload);

			return {
				title: payload.name,
				description: payload.description,
			};
		},
		onSuccess: (data) => {
			pushToast({
				type: "success",
				title: `OAuth アプリケーション「${data.title}」の登録が完了しました`,
			});
			navigate("/oauth-apps");
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
