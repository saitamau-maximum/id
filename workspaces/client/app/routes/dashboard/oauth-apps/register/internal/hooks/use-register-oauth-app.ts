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
	icon?: File;
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
				icon: payload.icon,
			});
		},
		onSuccess: (data) => {
			pushToast({
				type: "success",
				title: "OAuth アプリケーションを登録しました",
				timeout: 1000000,
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
