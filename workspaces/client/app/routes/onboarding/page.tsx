import { useEffect } from "react";
import { type MetaFunction, useNavigate } from "react-router";
import { css } from "styled-system/css";

import { Progress } from "~/components/ui/progess";
import { useAuth } from "~/hooks/use-auth";
import { RegisterForm } from "./internal/components/form";

export const meta: MetaFunction = () => {
	return [{ title: "初期設定 | Maximum IdP" }];
};

export default function Onboarding() {
	const { isLoading, isInitialized, isAuthorized, isProvisional } = useAuth();
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

	const registrationSteps = [
		{ label: "仮登録", isActive: true, isCompleted: false },
		{ label: "入金", isActive: false, isCompleted: false },
		{ label: "承認", isActive: false, isCompleted: false },
		{ label: "完了", isActive: false, isCompleted: false },
	];

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				overflowY: "auto",
			})}
		>
			<div>
				<div
					className={css({
						width: "100%",
						height: "100%",
						maxWidth: 640,
						margin: "auto",
						padding: 8,
						gap: 8,
						mdDown: {
							padding: 4,
						},
					})}
				>
					{isProvisional && <Progress steps={registrationSteps} />}
					<h1
						className={css({
							fontSize: "2xl",
							fontWeight: "bold",
							color: "gray.700",
							textAlign: "center",
							marginTop: isProvisional ? 8 : undefined,
							marginBottom: 8,
						})}
					>
						Maximum IDP 初期設定
					</h1>
					<RegisterForm />
				</div>
			</div>
		</div>
	);
}
