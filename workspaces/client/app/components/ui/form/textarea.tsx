import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"textarea">;

export const Textarea = ({ className, ...props }: Props) => {
	return (
		<textarea
			{...props}
			className={cx(
				css({
					padding: "token(spacing.2) token(spacing.4)",
					resize: "none",
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
