import { TOAST_MESSAGES, TOAST_SEARCHPARAM } from "@idp/server/shared/toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useToast } from "~/hooks/use-toast";

export const useSetup = () => {
	// Server 側からのリダイレクト時に Toast リクエストを処理するやつ
	const [searchParams] = useSearchParams();
	const { pushToast } = useToast();

	useEffect(() => {
		const toastId = searchParams.get(TOAST_SEARCHPARAM);
		if (toastId) {
			const msg = TOAST_MESSAGES[toastId];
			if (msg) pushToast(msg);
		}
	}, [searchParams, pushToast]);
};
