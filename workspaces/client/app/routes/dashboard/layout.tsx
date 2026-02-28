import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { css, cx } from "styled-system/css";
import { cq } from "styled-system/patterns";
import { useAuth } from "~/hooks/use-auth";
import { useAuthPing } from "~/hooks/use-auth-ping";
import { useInvitation } from "~/hooks/use-invitation";
import { useToast } from "~/hooks/use-toast";
import { Sidebar } from "./internal/components/sidebar";

export default function Dashboard() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoading, isAuthorized, isInitialized, isProvisional, isMember } =
		useAuth();
	const { pushToast } = useToast();
	const { setInvitationCode } = useInvitation();

	// ping を使って最終ログイン日時を更新し続ける
	useAuthPing(isAuthorized);

	useEffect(() => {
		if (isLoading) return;

		// 認証されていない場合はログイン画面へ
		if (!isAuthorized) {
			const redirectTo = location.pathname + location.search;
			navigate(`/login?redirect_to=${encodeURIComponent(redirectTo)}`);
			return;
		}

		// どうせログインしたら invitation code は使わないのでリセット
		setInvitationCode("");

		// 初期登録がまだの場合は初期登録画面へ
		if (!isInitialized) {
			navigate("/onboarding");
			return;
		}

		// 仮登録ユーザーの場合は入金情報画面へ
		if (isProvisional) {
			navigate("/payment-info");
			return;
		}

		// メンバーでない場合もログイン画面へ
		if (!isMember) {
			pushToast({
				title: "このアカウントはメンバーではありません",
				description: "参加するには招待を受ける必要があります",
				type: "error",
			});
			navigate("/login");
			return;
		}
	}, [
		isLoading,
		isAuthorized,
		isInitialized,
		isProvisional,
		isMember,
		navigate,
		location,
		pushToast,
		setInvitationCode,
	]);

	// リダイレクトされるべき場合は何も表示しない
	if (
		isLoading ||
		!isAuthorized ||
		!isMember ||
		!isInitialized ||
		isProvisional
	)
		return null;

	return (
		<div className={css({ display: "flex", height: "100%" })}>
			<Sidebar />
			<div
				className={cx(
					css({
						flex: 1,
						padding: 8,
						overflowY: "auto",
						mdDown: {
							padding: 4,
						},
					}),
					cq({
						name: "dashboard",
					}),
				)}
			>
				<Outlet />
			</div>
		</div>
	);
}
