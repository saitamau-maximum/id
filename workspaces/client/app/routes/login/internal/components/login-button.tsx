import type { FC, ReactNode } from "react";
import { css } from "styled-system/css";

interface LoginButtonProps {
	disabled?: boolean;
	children: ReactNode;
	bgColor?: string;
}

export const LoginButtonLike: FC<LoginButtonProps> = ({
	disabled,
	children,
	bgColor,
}) => {
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
				_hover: {
					opacity: 0.8,
				},
			})}
			style={{
				// 動的に指定しないとスタイルが効かない
				backgroundColor: bgColor,
			}}
		>
			{children}
		</span>
	);
};
