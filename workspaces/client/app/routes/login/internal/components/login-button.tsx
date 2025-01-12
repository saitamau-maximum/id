import { GitHub } from "react-feather";
import { css } from "styled-system/css";

interface LoginButtonProps {
	disabled?: boolean;
}

export const LoginButtonLike = ({ disabled }: LoginButtonProps) => {
	return (
		<span
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				padding: "token(spacing.2) token(spacing.4)",
				borderRadius: 8,
				fontSize: "md",
				fontWeight: "bold",
				cursor: "pointer",
				transition: "background",
				textDecoration: "none",
				userSelect: "none",
				color: "white",
				backgroundColor: "gray.900",
				_hover: {
					backgroundColor: "gray.700",
				},
			})}
		>
			<GitHub size={20} />
			Githubでログイン
		</span>
	);
};
