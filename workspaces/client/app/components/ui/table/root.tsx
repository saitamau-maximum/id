import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"table">;

export const Root = ({ children, className, ...props }: Props) => {
	return (
		<div
			className={css({
				overflowX: "auto",
				borderWidth: 1,
				borderStyle: "solid",
				borderRadius: "lg",
				borderColor: "gray.200",
			})}
		>
			<table
				className={cx(
					css({
						width: "100%",
						borderCollapse: "separate",
						borderSpacing: 0,
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
