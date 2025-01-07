import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";

import { useAuth } from "~/hooks/useAuth";
import { RegisterForm } from "./internal/form";

export default function Onboarding() {
	const { isLoading, isInitialzied, isAuthorized } = useAuth();
	const navigate = useNavigate();
	const shouldProoceed = !isLoading && !isInitialzied && isAuthorized;

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
				maxWidth: 400,
				margin: "auto",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				padding: "token(spacing.4)",
			})}
		>
			<h1
				className={css({
					fontSize: "2xl",
					fontWeight: "bold",
					color: "gray.700",
				})}
			>
				Maximum IDP 初期設定
			</h1>
			<RegisterForm />
		</div>
	);
}
