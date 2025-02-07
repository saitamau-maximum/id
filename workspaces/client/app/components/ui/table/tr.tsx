import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"tr">;

export const Tr = ({ children, className, onClick, ...props }: Props) => {
	return (
		<tr
			tabIndex={onClick ? 0 : undefined}
			className={cx(
				css({
					"&:last-child": {
						"& td": {
							borderBottomWidth: 0,
						},
					},
				}),
				className,
				onClick &&
					css({
						cursor: "pointer",
						transition: "colors",

						"&:hover": {
							backgroundColor: "gray.50",
						},

						"&:focus-visible": {
							backgroundColor: "gray.50",
						},
					}),
			)}
			onClick={onClick}
			{...props}
		>
			{children}
		</tr>
	);
};
