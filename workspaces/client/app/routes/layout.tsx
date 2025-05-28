import { Outlet } from "react-router";
import { css } from "styled-system/css";
import { useSetup } from "~/hooks/use-setup";

export default function Root() {
	useSetup();

	return (
		<div
			className={css({
				margin: "6",
				width: "calc(100% - token(spacing.6) * 2)",
				height: "calc(100dvh - token(spacing.6) * 2)",
				overflow: "hidden",
				background: "white",
				borderRadius: "md",
				lgDown: {
					margin: "4",
					width: "calc(100% - token(spacing.4) * 2)",
					height: "calc(100dvh - token(spacing.4) * 2)",
				},
				mdDown: {
					margin: "2",
					width: "calc(100% - token(spacing.2) * 2)",
					height: "calc(100dvh - token(spacing.2) * 2)",
				},
			})}
		>
			<Outlet />
		</div>
	);
}
