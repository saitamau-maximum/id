import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { css, cx } from "styled-system/css";
import { cq } from "styled-system/patterns";
import { useAuth } from "~/hooks/use-auth";
import { Sidebar } from "./internal/components/sidebar";

export default function Dashboard() {
	const navigate = useNavigate();
	const { isLoading, isAuthorized, isInitialized, isProvisional } = useAuth();

	// 認証されていない場合: ログイン画面へリダイレクト
	const shouldLogin = !isAuthorized;
	// 初期登録がまだの場合: 初期登録画面へリダイレクト
	const shouldOnboarding = isAuthorized && !isInitialized;
	// 仮登録ユーザー: 入金情報画面へリダイレクト
	const shouldPaymentInfo = isAuthorized && isInitialized && isProvisional;

	useEffect(() => {
		if (isLoading) return;

		if (shouldLogin) {
			navigate("/login");
		}
		if (shouldOnboarding) {
			navigate("/onboarding");
		}
		if (shouldPaymentInfo) {
			navigate("/payment-info");
		}
	}, [isLoading, shouldLogin, shouldOnboarding, shouldPaymentInfo, navigate]);

	// 認証済みかつ初期登録済みかつ本登録ユーザーの場合以外は何も表示しない
	if (!isAuthorized || !isInitialized || isProvisional) {
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
