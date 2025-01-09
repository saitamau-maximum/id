import type { ComponentProps } from "react";
import { css, cva, cx } from "styled-system/css";

type Props = ComponentProps<"span"> & {
	variant?: "primary" | "secondary";
	disabled?: boolean;
};

const buttonLikeStyle = cva({
	base: {
		display: "inline-block",
		padding: "token(spacing.1) token(spacing.4)",
		borderRadius: 8,
		borderStyle: "solid",
		borderWidth: 2,
		fontSize: "md",
		fontWeight: "bold",
		width: "120px",
		cursor: "pointer",
		transition: ["background", "colors"],
		textDecoration: "none",
		textAlign: "center",
	},
	variants: {
		variant: {
			primary: {
				color: "white",
				backgroundColor: "green.600",
				borderColor: "green.600",
				_hover: {
					backgroundColor: "green.500",
					borderColor: "green.500",
				},
			},
			secondary: {
				color: "green.600",
				backgroundColor: "white",
				borderColor: "green.600",
				_hover: {
					backgroundColor: "green.600",
					color: "white",
				},
			},
		},
		disabled: {
			true: {
				opacity: 0.5,
				cursor: "not-allowed",
			},
		},
	},
});

export const ButtonLike = ({
	variant = "primary",
	disabled,
	className,
	...props
}: Props) => {
	return (
		<span
			{...props}
			className={cx(className, buttonLikeStyle({ variant, disabled }))}
		/>
	);
};
