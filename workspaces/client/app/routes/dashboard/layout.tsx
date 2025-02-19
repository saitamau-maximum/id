import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { css, cx } from "styled-system/css";
import { cq } from "styled-system/patterns";
import { useAuth } from "~/hooks/use-auth";
import { Sidebar } from "./internal/components/sidebar";

export default function Dashboard() {
	const navigate = useNavigate();
	const { isLoading, isAuthorized, isInitialized } = useAuth();

	// 読み込みが終わっていてかつ認証されていない場合はログイン画面にリダイレクト
	const shouldLogin = !isLoading && !isAuthorized;
	// 読み込みが終わっていてかつ初期登録がまだの場合は初期登録画面にリダイレクト
	const shouldOnboarding = !isLoading && isAuthorized && !isInitialized;

	useEffect(() => {
		if (shouldLogin) {
			navigate("/login");
		}
		if (shouldOnboarding) {
			navigate("/onboarding");
		}
	}, [shouldLogin, shouldOnboarding, navigate]);

	// 認証済みかつ初期登録済みの場合以外は何も表示しない
	if (!isAuthorized || !isInitialized) {
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
