import { useEffect } from "react";
import { type MetaFunction, useNavigate, useParams } from "react-router";
import { useAuth } from "~/hooks/use-auth";
import { useInvitation } from "~/hooks/use-invitation";
import { useToast } from "~/hooks/use-toast";
import { useCheckInvitation } from "./internal/hooks/use-check-invitation";

export const meta: MetaFunction = () => {
	return [{ title: "Loading..." }];
};

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();
	const { isLoading, isAuthorized } = useAuth();
	const { setInvitationCode } = useInvitation();

	const {
		isLoading: isInvitationLoading,
		data: existsInvitation,
		error: invitationCheckError,
	} = useCheckInvitation(id);

	useEffect(() => {
		// useAuth と useInvitation の初期化が終わるまで何もしない
		if (isLoading || isInvitationLoading) return;

		// useParams の id が存在しない または 認証済み の場合は / にリダイレクト
		if (!id || isAuthorized) {
			navigate("/");
			return;
		}

		if (invitationCheckError) {
			pushToast({
				type: "error",
				title: "招待コードの取得に失敗しました",
				description:
					"時間をおいて再度お試しください。もし直らなければ Admin に連絡してください。",
			});
		} else if (existsInvitation) {
			setInvitationCode(id);
		} else {
			pushToast({
				type: "error",
				title: "招待コードは無効です",
				description:
					"正しい招待コードであるかチェックしてください。もし招待コードが正しい場合は、Admin に連絡してください。",
			});
		}
		navigate("/login");
	}, [
		isLoading,
		isInvitationLoading,
		id,
		isAuthorized,
		invitationCheckError,
		existsInvitation,
		navigate,
		pushToast,
		setInvitationCode,
	]);

	return null;
}
