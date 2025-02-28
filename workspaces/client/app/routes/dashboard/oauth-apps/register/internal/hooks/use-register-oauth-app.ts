import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

interface IMutationParams {
	name: string;
	description: string;
	scopeIds: string[];
	callbackUrls: {
		value: string;
	}[];
	icon: FileList;
}

export function useRegisterOAuthApp() {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: IMutationParams) => {
			return oauthAppsRepository.registerApp({
				...payload,
				scopeIds: payload.scopeIds.map(Number),
				callbackUrls: payload.callbackUrls.map((url) =>
					// URL に , が含まれるかもしれないのでエンコードする
					encodeURIComponent(url.value),
				),
				icon: payload.icon.length > 0 ? payload.icon[0] : undefined,
			});
		},
		onSuccess: (data) => {
			pushToast({
				type: "success",
				title: `OAuth アプリケーション「${data.title}」の登録が完了しました`,
				description: data.description,
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
