import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";

import { useAuth } from "~/hooks/use-auth";
import { RegisterForm } from "./internal/form";

export default function Onboarding() {
	const { isLoading, isInitialized, isAuthorized } = useAuth();
	const navigate = useNavigate();
	const shouldProoceed = !isLoading && !isInitialized && isAuthorized;

	useEffect(() => {
		if (!shouldProoceed) {
			navigate("/");
		}
	}, [shouldProoceed, navigate]);

	if (!shouldProoceed) {
		return null;
	}

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				overflowY: "auto",
			})}
		>
			<div
				className={css({
					width: "100%",
					height: "100%",
					maxWidth: 400,
					margin: "auto",
					padding: "token(spacing.8) token(spacing.4)",
					gap: 8,
					_after: {
						content: "''",
						display: "block",
						width: "100%",
						height: "token(spacing.8)", // スクロール時にパディング分が消えないようにするハック
					},
				})}
			>
				<h1
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.700",
						textAlign: "center",
						marginBottom: 8,
					})}
				>
					Maximum IDP 初期設定
				</h1>
				<RegisterForm />
			</div>
		</div>
	);
}
