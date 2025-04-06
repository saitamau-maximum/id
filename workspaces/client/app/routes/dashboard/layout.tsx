import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { css, cx } from "styled-system/css";
import { cq } from "styled-system/patterns";
import { useAuth } from "~/hooks/use-auth";
import { Sidebar } from "./internal/components/sidebar";

export default function Dashboard() {
	const navigate = useNavigate();
	const { isLoading, isAuthorized, isInitialized, isProvisional } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		// 認証されていない場合はログイン画面へ
		if (!isAuthorized) {
			navigate("/login");
			return;
		}

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
	}, [isLoading, isAuthorized, isInitialized, isProvisional, navigate]);

	// リダイレクトされるべき場合は何も表示しない
	if (isLoading || !isAuthorized || !isInitialized || isProvisional) {
		return null;
	}

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
