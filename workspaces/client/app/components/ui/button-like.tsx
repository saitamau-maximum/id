import type { ComponentProps } from "react";
import { cva, cx } from "styled-system/css";

type Props = ComponentProps<"span"> & {
	variant?: "primary" | "secondary" | "danger" | "text";
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
		borderWidth: 1,
		fontWeight: 600,
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
				color: "gray.600",
				backgroundColor: "transparent",
				borderColor: "gray.400",
				_hover: {
					backgroundColor: "rgba(0, 0, 0, 0.05)",
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
			text: {
				color: "green.600",
				backgroundColor: "transparent",
				borderColor: "transparent",
				_hover: {
					backgroundColor: "rgba(0, 0, 0, 0.05)",
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
