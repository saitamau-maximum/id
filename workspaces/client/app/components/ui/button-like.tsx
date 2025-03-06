import type { ComponentProps } from "react";
import { cva, cx } from "styled-system/css";

type Props = ComponentProps<"span"> & {
	variant?: "primary" | "secondary" | "danger";
	disabled?: boolean;
	size?: "sm" | "md";
};

const buttonLikeStyle = cva({
	base: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
		borderRadius: 8,
		borderStyle: "solid",
		borderWidth: 2,
		fontWeight: "bold",
		cursor: "pointer",
		transition: ["background", "colors"],
		textDecoration: "none",
		userSelect: "none",
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
			danger: {
				color: "white",
				backgroundColor: "rose.600",
				borderColor: "rose.600",
				_hover: {
					backgroundColor: "rose.500",
					borderColor: "rose.500",
				},
			},
		},
		disabled: {
			true: {
				pointerEvents: "none",
				backgroundColor: "gray.300",
				borderColor: "gray.300",
			},
		},
		size: {
			sm: {
				padding: "token(spacing.1) token(spacing.2)",
				fontSize: "sm",
				minWidth: "80px",
			},
			md: {
				padding: "token(spacing.1) token(spacing.4)",
				fontSize: "md",
				minWidth: "120px",
			},
		},
	},
});

export const ButtonLike = ({
	variant = "primary",
	disabled,
	className,
	size = "md",
	...props
}: Props) => {
	return (
		<span
			{...props}
			className={cx(className, buttonLikeStyle({ variant, disabled, size }))}
		/>
	);
};
