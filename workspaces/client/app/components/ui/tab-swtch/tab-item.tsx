import type { JSX } from "react";
import { css } from "styled-system/css";

type TabItemProps = {
	active: boolean;
	text: string;
};

export const TabItem = ({ active, text }: TabItemProps): JSX.Element => {
	return (
		<div
			className={css({
				flex: 1,
				textAlign: "center",
				borderRadius: "4px",
				fontSize: "sm",
				fontWeight: "bold",
				color: active ? "white" : "gray.700",
				backgroundColor: active ? "green.600" : "gray.200",
				padding: "4px",
				transition: "background-color 0.3s ease",
			})}
		>
			{text}
		</div>
	);
};
