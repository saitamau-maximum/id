import { Link, useLocation } from "react-router";
import { css } from "styled-system/css";

interface Props {
	to: string;
	isActive: (location: string) => boolean;
	children: React.ReactNode;
}

export const TabItem = ({ to, isActive, children }: Props) => {
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
		</Link>
	);
};
