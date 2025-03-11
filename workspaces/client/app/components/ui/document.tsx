import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

interface Props {
	children: ReactNode;
	className?: string;
	inlineOnly?: boolean;
}

export const Document = ({
	children,
	className,
	inlineOnly = false,
}: Props) => {
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
					"& img": {
						display: inlineOnly ? "none" : "block",
						maxWidth: "100%",
					},
					"& blockquote": {
						display: inlineOnly ? "none" : "block",
						padding: "token(spacing.2)",
						borderLeft: "4px solid",
						borderColor: "gray.300",
						backgroundColor: "gray.100",
						margin: "token(spacing.2) 0",
						"& p": {
							margin: 0,
						},
					},
					"& code": {
						backgroundColor: "gray.100",
						padding: "0.1em 0.2em",
						borderRadius: 4,
						fontSize: "sm",
					},
					"& pre": {
						display: inlineOnly ? "none" : "block",
						backgroundColor: "gray.100",
						padding: "token(spacing.2)",
						borderRadius: 4,
						overflowX: "auto",
						fontSize: "sm",
						"& code": {
							backgroundColor: "transparent",
							padding: 0,
							borderRadius: 0,
							fontSize: "inherit",
						},
					},
					"& hr": {
						border: 0,
						borderTop: "1px solid",
						borderColor: "gray.300",
					},
					"& h1": {
						display: inlineOnly ? "none" : "block",
						fontSize: "3xl",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
					"& h2": {
						display: inlineOnly ? "none" : "block",
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
					"& h3": {
						display: inlineOnly ? "none" : "block",
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
					"& h4": {
						display: inlineOnly ? "none" : "block",
						fontSize: "lg",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
					"& h5": {
						display: inlineOnly ? "none" : "block",
						fontSize: "md",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
					"& h6": {
						display: inlineOnly ? "none" : "block",
						fontSize: "sm",
						fontWeight: "bold",
						color: "gray.600",
						margin: "token(spacing.4) 0 token(spacing.2)",
					},
				}),
				className,
			)}
		>
			{children}
		</div>
	);
};
