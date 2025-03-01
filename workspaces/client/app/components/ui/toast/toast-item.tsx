import { AlertCircle, CheckCircle } from "react-feather";
import { Link } from "react-router";
import { css, cva, cx } from "styled-system/css";

export interface ToastItemProps {
	type: "error" | "success";
	title: string;
	description?: string;
	to?: string;
}

const toastItemContainerStyle = cva({
	base: {
		width: "320px",
		padding: 4,
		borderRadius: 8,
		backgroundColor: "white",
		boxShadow: "lg",
		overflow: "hidden",
		borderWidth: 2,
		borderStyle: "solid",
		display: "grid",
		gridTemplateColumns: "auto 1fr",
		placeItems: "center",
		gap: 4,
	},
	variants: {
		type: {
			error: {
				color: "gray.700",
				borderColor: "red.600",
			},
			success: {
				color: "gray.700",
				borderColor: "green.600",
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

const ICONS = {
	error: <AlertCircle className={css({ color: "red.600" })} />,
	success: <CheckCircle className={css({ color: "green.600" })} />,
} as const;

export const ToastItem = ({ type, title, description, to }: ToastItemProps) => {
	const InnerContent = () => {
		return (
			<>
				{ICONS[type]}
				<div className={css({ width: "100%" })}>
					<span
						className={css({
							fontSize: "md",
							fontWeight: "bold",
							textWrap: "balance",
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
								color: "inherit",
							})}
						>
							{description}
						</p>
					)}
				</div>
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
