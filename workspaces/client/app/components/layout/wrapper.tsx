import { Outlet } from "react-router";
import { css } from "styled-system/css";

export default function Wrapper() {
	return (
		<div
			className={css({
				margin: "6",
				width: "calc(100vw - token(spacing.6) * 2)",
				height: "calc(100dvh - token(spacing.6) * 2)",
				background: "white",
				borderRadius: "md",
			})}
		>
			<Outlet />
		</div>
	);
}
