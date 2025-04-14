import type React from "react";
import type { ComponentProps } from "react";
import { css } from "styled-system/css";

type Props = ComponentProps<"details"> & {
	summary: React.ReactNode;
};

export const Details = ({ children, summary, ...props }: Props) => {
	return (
		<details
			className={css({
				width: "100%",
				border: "1px solid",
				borderColor: "gray.200",
				borderRadius: "md",
				backgroundColor: "white",
				overflow: "hidden",
			})}
			{...props}
		>
			<summary
				className={css({
					fontWeight: "bold",
					color: "gray.600",
					cursor: "pointer",
					transition: "all",
					padding: "token(spacing.2) token(spacing.4)",

					_hover: {
						backgroundColor: "gray.100",
					},
				})}
			>
				{summary}
			</summary>
			<div
				className={css({
					padding: 4,
					paddingTop: 2,
					fontSize: "sm",
					color: "gray.600",
					lineHeight: "base",
				})}
			>
				{children}
			</div>
		</details>
	);
};
