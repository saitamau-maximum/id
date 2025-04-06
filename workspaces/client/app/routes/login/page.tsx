import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { css } from "styled-system/css";
import { useAuth } from "~/hooks/use-auth";
import { useInvitation } from "~/hooks/use-invitation";
import { useToast } from "~/hooks/use-toast";
import { env } from "~/utils/env";
import { FLAG } from "~/utils/flag";
import { LoginButtonLike } from "./internal/components/login-button";

export default function Login() {
	const { isLoading, isAuthorized } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { pushToast } = useToast();
	const { isInvited } = useInvitation();

	const shouldProceed = !isLoading && isAuthorized;

	// もし continue_to がクエリパラメータに指定されていたらそれを使う
	const continueToURL = encodeURIComponent(
		searchParams.get("continue_to") ?? `${window.location.origin}/verify`,
	);

	useEffect(() => {
		if (shouldProceed) {
			navigate("/");
		}
	}, [shouldProceed, navigate]);

	useEffect(() => {
		if (searchParams.has("continue_to")) {
			pushToast({
				type: "error",
				title: "ログインしてください",
				description:
					"OAuth アプリケーションを利用するためにはログインが必要です",
			});
		}
	}, [searchParams, pushToast]);

	if (shouldProceed) {
		return null;
	}

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				padding: 4,
			})}
		>
			<img
				src="/Maximum-logo.svg"
				alt="logo"
				width="200"
				height="40"
				className={css({
					width: "200px",
					height: "40px",
					mdDown: {
						width: "150px",
						height: "30px",
					},
				})}
			/>
			<h1
				className={css({
					fontSize: "4xl",
					fontWeight: 800,
					color: "gray.600",
					mdDown: {
						fontSize: "3xl",
					},
				})}
			>
				Maximum IDP
			</h1>
			<p
				className={css({
					textAlign: "center",
					color: "gray.600",
					lineHeight: 2,
				})}
			>
				Maximum IDPへようこそ！
				<br />
				埼玉大学のプログラミングサークル「Maximum」のプロフィール管理システムです
				{isInvited && (
					<p>
						招待を受け入れるには以下のボタンから GitHub
						アカウントでログインしてください。
					</p>
				)}
			</p>
			{FLAG.ENABLE_LOGIN ? (
				<a
					href={`${env("SERVER_HOST")}/auth/login/github?continue_to=${continueToURL}`}
				>
					<LoginButtonLike />
				</a>
			) : (
				<LoginButtonLike disabled />
			)}
		</div>
	);
}
