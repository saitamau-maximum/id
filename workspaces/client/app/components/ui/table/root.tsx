import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"table"> & {
	loading?: boolean;
};

export const Root = ({ children, className, loading, ...props }: Props) => {
	return (
		<div
			className={css({
				position: "relative",
				overflowX: "auto",
				borderWidth: 1,
				borderStyle: "solid",
				borderRadius: "lg",
				borderColor: "gray.200",
				pointerEvents: loading ? "none" : "auto",
			})}
		>
			{loading && (
				<div
					className={css({
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1,
						color: "gray.700",
					})}
				>
					Loading...
				</div>
			)}
			<table
				className={cx(
					css({
						width: "100%",
						borderCollapse: "separate",
						borderSpacing: 0,
						opacity: loading ? 0.5 : 1,
					}),
					className,
				)}
				{...props}
			>
				{children}
			</table>
		</div>
	);
};
