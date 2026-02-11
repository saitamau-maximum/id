import { useMutation } from "@tanstack/react-query";
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

export function useUpdateOAuthApp({ id }: { id: string }) {
	const { oauthAppsRepository } = useRepository();
	const { pushToast } = useToast();

	return useMutation({
		mutationFn: (payload: IMutationParams) =>
			oauthAppsRepository.updateApp(id, {
				...payload,
				scopeIds: payload.scopeIds.map(Number),
				callbackUrls: payload.callbackUrls.map((url) =>
					// URL に , が含まれるかもしれないのでエンコードする
					encodeURIComponent(url.value),
				),
				icon: payload.icon,
			}),
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
