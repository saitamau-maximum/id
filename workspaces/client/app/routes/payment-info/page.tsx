// import { useEffect } from "react";
// import { useNavigate } from "react-router";
import { css } from "styled-system/css";

// import { useAuth } from "~/hooks/use-auth";
// import { RegisterForm } from "./internal/components/form";

export default function PaymentInfo() {
	// const { isLoading, isInitialized, isAuthorized } = useAuth();
	// const navigate = useNavigate();
	// const shouldProoceed = !isLoading && !isInitialized && isAuthorized;

	// useEffect(() => {
	//   if (!shouldProoceed) {
	//     navigate("/");
	//   }
	// }, [shouldProoceed, navigate]);

	// if (!shouldProoceed) {
	//   return null;
	// }

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
						maxWidth: 500,
						margin: "auto",
						padding: 8,
						gap: 8,
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
						Payment Info (WIP)
					</h1>
				</div>
			</div>
		</div>
	);
}
