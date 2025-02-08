import { css } from "styled-system/css";

interface Props {
	title: string;
	children?: React.ReactNode;
}

export const ConfigSectionSubHeader = ({ title, children }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				gap: 2,
				height: "32px",
				marginTop: 2,
				marginBottom: 1,
			})}
		>
			<h4
				className={css({
					fontSize: "lg",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				{title}
			</h4>
			{children}
		</div>
	);
};
