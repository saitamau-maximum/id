import { AlertCircle, CheckCircle, Info } from "react-feather";
import { Link } from "react-router";
import { css, cva, cx } from "styled-system/css";

export interface ToastItemProps {
	type: "error" | "success" | "info";
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
				borderColor: "rose.600",
			},
			success: {
				color: "gray.700",
				borderColor: "green.600",
			},
			info: {
				color: "gray.700",
				borderColor: "sky.500",
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
	error: <AlertCircle className={css({ color: "rose.600" })} />,
	success: <CheckCircle className={css({ color: "green.600" })} />,
	info: <Info className={css({ color: "sky.500" })} />,
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
