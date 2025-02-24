import type { ComponentProps } from "react";
import { css } from "styled-system/css";

type Props = Exclude<ComponentProps<"button">, "aria-label"> & {
	children: React.ReactNode;
	label: string;
};

export const 	IconButton = ({ children, label, ...props }: Props) => (
	<button
		type="submit"
		className={css({
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
			borderColor: "gray.300",
			color: "gray.500",
			cursor: "pointer",
			transition: "all",

			"&:hover": {
				background: "gray.200",
			},
		})}
		aria-label={label}
		{...props}
	>
		{children}
	</button>
);
