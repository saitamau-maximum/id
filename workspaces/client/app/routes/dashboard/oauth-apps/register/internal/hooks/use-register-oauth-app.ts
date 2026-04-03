import { ScopeId } from "@idp/schema/entity/oauth-external/scope";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import * as v from "valibot";
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
		mutationFn: async (payload: IMutationParams) => {
			await oauthAppsRepository.registerApp({
				...payload,
				scopeIds: payload.scopeIds
					.map(Number)
					.filter((scopeId) => v.is(ScopeId, scopeId)),
				callbackUrls: payload.callbackUrls.map((url) =>
					// URL に , が含まれるかもしれないのでエンコードする
					encodeURIComponent(url.value),
				),
				icon: payload.icon,
			});

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
