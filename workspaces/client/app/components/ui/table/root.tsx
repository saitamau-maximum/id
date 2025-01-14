import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"table">;

export const Root = ({ children, className, ...props }: Props) => {
	return (
		<table
			className={cx(
				css({
					width: "fit-content",
					maxWidth: "100%",
					borderCollapse: "separate",
					borderSpacing: 0,
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "gray.200",
					borderRadius: "lg",
					overflow: "hidden",
					display: "block",
					overflowX: "auto",
				}),
				className,
			)}
			{...props}
		>
			{children}
		</table>
	);
};
