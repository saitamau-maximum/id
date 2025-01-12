import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { AnchorLike } from "~/components/ui/anchor-like";
import { ButtonLike } from "~/components/ui/button-like";
import { useAuth } from "~/hooks/use-auth";
import { env } from "~/utils/env";
import { FLAG } from "~/utils/flag";

export default function Login() {
	const { isLoading, isAuthorized } = useAuth();
	const navigate = useNavigate();

	const shouldProceed = !isLoading && isAuthorized;

	useEffect(() => {
		if (shouldProceed) {
			navigate("/");
		}
	}, [shouldProceed, navigate]);

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
				<br />
				<a
					href="https://github.com/saitamau-maximum"
					className={css({ color: "blue.500" })}
				>
					<AnchorLike>Github Organization</AnchorLike>
				</a>
				に所属している方であれば <br />
				どなたでもログイン可能です。
			</p>
			{FLAG.ENABLE_LOGIN ? (
				<a href={`${env("SERVER_HOST")}/auth/login/github`}>
					<ButtonLike>Login</ButtonLike>
				</a>
			) : (
				<ButtonLike disabled>Login</ButtonLike>
			)}
		</div>
	);
}
