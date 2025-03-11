import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

interface Props {
	children: ReactNode;
	className?: string;
}

export const Document = ({ children, className }: Props) => {
	return (
		<div
			className={cx(
				css({
					"& a": {
						color: "green.600",
						textDecoration: "underline",
						transition: "color",
						_hover: {
							color: "green.700",
						},
					},
					"& p": {
						overflowWrap: "break-word",
						whiteSpace: "pre-wrap",
					},
					"& ul": {
						listStyleType: "disc",
						paddingLeft: 4,
					},
					"& ol": {
						listStyleType: "decimal",
						paddingLeft: 4,
					},
					"&>*": {
						marginTop: 2,
					},
					"&>*:first-child": {
						marginTop: 0,
					},
				}),
				className,
			)}
		>
			{children}
		</div>
	);
};
