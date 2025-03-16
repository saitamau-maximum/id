import { Link, useLocation } from "react-router";
import { css } from "styled-system/css";

interface Props {
	to: string;
	isActive: (location: string) => boolean;
	children: React.ReactNode;
	notification?: number;
}

export const TabItem = ({
	to,
	isActive,
	children,
	notification = 0,
}: Props) => {
	const location = useLocation();

	return (
		<Link
			key={to}
			to={to}
			className={css({
				cursor: "pointer",
				padding: "token(spacing.2) token(spacing.4)",
				position: "relative",
				transition: "background",
				display: "flex",
				alignItems: "center",
				gap: 2,

				_after: {
					content: "''",
					position: "absolute",
					top: "100%",
					left: 0,
					width: "100%",
					height: "2px",
					backgroundColor: isActive(location.pathname)
						? "green.500"
						: "transparent",
					transition: "background",
				},
				_hover: {
					backgroundColor: "gray.100",
				},
			})}
		>
			{children}
			{notification > 0 && (
				<div
					className={css({
						padding: "token(spacing.1)",
						borderRadius: "full",
						width: 4,
						height: 4,
						display: "inline-flex",
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "gray.200",
						color: "gray.700",
						fontSize: "xs",
						fontWeight: 500,
						fontFamily: "sans",
					})}
				>
					{notification}
				</div>
			)}
		</Link>
	);
};
