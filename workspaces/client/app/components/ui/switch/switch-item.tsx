import type { JSX } from "react";
import { css } from "styled-system/css";

type TabItemProps = {
	isActive: boolean;
	text: string;
	onClick?: () => void;
};

export const SwitchItem = ({
	isActive,
	text,
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
				color: isActive ? "green.700" : "gray.500",
				backgroundColor: isActive ? "green.100" : "inherit",
				borderRadius: "20px",
				_hover: {
					backgroundColor: isActive ? "green.100" : "gray.100",
				},
			})}
		>
			{text}
		</button>
	);
};
