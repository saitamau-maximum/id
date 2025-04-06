import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/use-auth";
import { useInvitation } from "~/hooks/use-invitation";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const { invitationRepository } = useRepository();
	const { isLoading, isAuthorized, isInitialized } = useAuth();
	const { setIsInvited } = useInvitation();

	const authorized = !isLoading && isAuthorized;
	const shouldOnboarding = !isLoading && isAuthorized && !isInitialized;

	const mutation = useMutation({
		mutationFn: async (id: string) => {
			const isSucceeded = await invitationRepository.fetchInvitation({
				invitationId: id,
			});
			if (!isSucceeded) {
				throw new Error("Failed to fetch invitation");
			}
		},
		onSuccess: () => {
			setIsInvited(true);
			navigate("/login");
		},
		onError: () =>
			pushToast({
				type: "error",
				title: "招待コードの取得に失敗しました",
				description:
					"時間をおいて再度お試しください。もし直らなければ Admin に連絡してください。",
			}),
	});

	useEffect(() => {
		// useAuth と useMutation の初期化が終わるまで何もしない (error 時も return)
		if (isLoading || mutation.isPending || mutation.error) return;

		// useParams の id が存在しないか、認証済みの場合は /login にリダイレクト
		if (!id || authorized) {
			navigate("/login");
			return;
		}

		// 認証済みかつ初期登録が済んでいない場合は /onboarding にリダイレクト
		if (shouldOnboarding) {
			navigate("/onboarding");
			return;
		}

		mutation.mutate(id);
	}, [isLoading, authorized, shouldOnboarding, id, navigate, mutation]);

	return null;
}
