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
				paddingBottom: "2px", // tab-item の _after の高さに合わせる
				borderBottomWidth: "2px",
				borderColor: "gray.200",
				maxWidth: "100%",
				overflowX: "auto",
			})}
		>
			{children}
		</div>
	);
};
