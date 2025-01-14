import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"input">;

export const Input = ({ className, ...props }: Props) => {
	return (
		<input
			{...props}
			className={cx(
				css({
					padding: "token(spacing.2) token(spacing.4)",
					borderRadius: 6,
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "gray.300",
					backgroundColor: "white",
					outline: "none",
					width: "100%",
					transition: "border-color 0.2s ease",
					"&:focus": {
						borderColor: "green",
					},
				}),
				className,
			)}
		/>
	);
};
