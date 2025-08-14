import { css } from "styled-system/css";

interface Props {
	children: React.ReactNode;
}

export const TabList = ({ children }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				marginBottom: 8,
				borderBottomWidth: "2px",
				borderColor: "gray.200",
				maxWidth: "100%",
				overflowX: "auto",
				overflowY: "hidden",
			})}
		>
			{children}
		</div>
	);
};
