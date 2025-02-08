import { css } from "styled-system/css";

interface Props {
	children: React.ReactNode;
}

export const ConfigSectionHeader = ({ children }: Props) => {
	return (
		<h3
			className={css({
				fontSize: "xl",
				fontWeight: "bold",
				color: "gray.600",
				marginBottom: 4,
				paddingBottom: 2,
				borderBottomWidth: 1,
				borderBottomStyle: "solid",
				borderBottomColor: "gray.200",
			})}
		>
			{children}
		</h3>
	);
};
