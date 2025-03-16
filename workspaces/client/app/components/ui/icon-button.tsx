import type { ComponentProps } from "react";
import { cva } from "styled-system/css";

type Props = Exclude<ComponentProps<"button">, "aria-label"> & {
	children: React.ReactNode;
	label: string; // アイコンボタンは参照テキストがないので、aria-labelが必要となる
	variant?: "icon" | "border";
	color?: "text" | "apply" | "danger";
};

const iconButtonStyle = cva({
	base: {
		display: "inline-flex",
		verticalAlign: "middle",
		alignItems: "center",
		justifyContent: "center",
		width: 7,
		height: 7,
		borderRadius: "full",
		background: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		color: "gray.500",
		cursor: "pointer",
		transition: "all",

		"&:hover": {
			background: "rgba(0, 0, 0, 0.05)",
		},
	},
	variants: {
		variant: {
			icon: {
				borderColor: "transparent",
			},
			border: {
				borderColor: "gray.300",
			},
		},
		color: {
			text: {
				color: "gray.500",
			},
			apply: {
				color: "green.600",
			},
			danger: {
				color: "rose.600",
			},
		},
		disabled: {
			true: {
				color: "token(colors.gray.300) !important",
				cursor: "auto",

				"&:hover": {
					background: "transparent",
				},
			},
		},
	},
});

export const IconButton = ({
	children,
	label,
	variant = "icon",
	color = "text",
	disabled,
	...props
}: Props) => (
	<button
		className={iconButtonStyle({ variant, color, disabled })}
		aria-label={label}
		disabled={disabled}
		{...props}
	>
		{children}
	</button>
);
