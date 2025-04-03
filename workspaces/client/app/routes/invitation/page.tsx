import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { FetchInvitationParams } from "~/repository/invitation";

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const { invitationRepository } = useRepository();

	if (!id) {
		navigate("/login");
		return null;
	}

	const { isLoading, error } = useQuery({
		queryKey: invitationRepository.fetchInvitation$$key(id),
		queryFn: async () => {
			const params: FetchInvitationParams = { invitationId: id };
			return invitationRepository.fetchInvitation(params);
		},
	});

	useEffect(() => {
		if (isLoading) return;

		if (error) {
			pushToast({
				type: "error",
				title: "招待コードの取得に失敗しました",
				description:
					"時間をおいて再度お試しください。もし直らなければ Admin に連絡してください。",
			});
			return;
		}

		navigate("/login");
	}, [isLoading, error, navigate, pushToast]);

	return null;
}
