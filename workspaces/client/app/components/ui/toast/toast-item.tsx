import { Link } from "react-router";
import { css, cva, cx } from "styled-system/css";

export interface ToastItemProps {
	type: "error" | "info";
	title: string;
	description?: string;
	to?: string;
}

const toastItemContainerStyle = cva({
	base: {
		width: "320px",
		padding: "token(spacing.4) token(spacing.6)",
		borderRadius: 8,
		backgroundColor: "white",
		boxShadow: "lg",
		overflow: "hidden",
		borderWidth: 1,
		borderStyle: "solid",
	},
	variants: {
		type: {
			error: {
				backgroundColor: "red.500",
				color: "white",
				borderColor: "red.600",
			},
			info: {
				backgroundColor: "white",
				color: "gray.700",
				borderColor: "gray.300",
			},
		},
	},
});

const linkStyle = css({
	textDecoration: "none",
	transition: "all",

	"&:hover": {
		filter: "brightness(0.95)",
	},
});

export const ToastItem = ({
	type = "info",
	title,
	description,
	to,
}: ToastItemProps) => {
	const InnerContent = () => {
		return (
			<>
				<span
					className={css({
						fontSize: "md",
						fontWeight: "bold",
						textWrap: "balance",
						wordBreak: "auto-phrase",
						color: "inherit",
					})}
				>
					{title}
				</span>
				{description && (
					<p
						className={css({
							fontSize: "sm",
							textWrap: "balance",
							wordBreak: "auto-phrase",
							color: "inherit",
						})}
					>
						{description}
					</p>
				)}
			</>
		);
	};

	if (to) {
		return (
			<Link
				to={to}
				className={cx(
					toastItemContainerStyle({
						type,
					}),
					linkStyle,
				)}
			>
				<InnerContent />
			</Link>
		);
	}

	return (
		<div
			className={toastItemContainerStyle({
				type,
			})}
		>
			<InnerContent />
		</div>
	);
};
