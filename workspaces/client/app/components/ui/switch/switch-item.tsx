import type React from "react";
import type { JSX } from "react";
import { css } from "styled-system/css";

type TabItemProps = {
	isActive: boolean;
	children: React.ReactNode;
	onClick?: () => void;
};

export const SwitchItem = ({
	isActive,
	children,
	onClick,
}: TabItemProps): JSX.Element => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isActive}
			className={css({
				cursor: "pointer",
				padding: "token(spacing.2) token(spacing.4)",
				lineHeight: 1,
				color: isActive ? "green.700" : "gray.500",
				backgroundColor: isActive ? "green.100" : "transparent",
				borderRadius: "xl",
				display: "flex",
				alignItems: "center",
				gap: 1,
				_hover: {
					backgroundColor: isActive ? "green.100" : "gray.100",
				},
			})}
		>
			{children}
		</button>
	);
};
