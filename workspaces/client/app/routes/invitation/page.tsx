import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { JWT_STORAGE_KEY } from "~/constant";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const { invitationRepository } = useRepository();

	const mutation = useMutation({
		mutationFn: async (id: string) => {
			const isSucceeded = await invitationRepository.fetchInvitation({
				invitationId: id,
			});
			if (!isSucceeded) {
				throw new Error("Failed to fetch invitation");
			}
		},
		onSuccess: () => navigate("/login"),
		onError: () => {
			pushToast({
				type: "error",
				title: "招待コードの取得に失敗しました",
				description:
					"時間をおいて再度お試しください。もし直らなければ Admin に連絡してください。",
			});
		},
	});

	useEffect(() => {
		// 既にログインしている場合に /invite に Preflight request が発生しないようにする
		if (localStorage.getItem(JWT_STORAGE_KEY)) {
			localStorage.removeItem(JWT_STORAGE_KEY);
		}

		if (!id) {
			navigate("/login");
			return;
		}

		if (mutation.isPending || mutation.error) return;
		mutation.mutate(id);
	}, [mutation, id, navigate]);

	return null;
}
