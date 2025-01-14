import { css } from "styled-system/css";

interface Props {
	title: string;
	subtitle?: string;
}

export const DashboardHeader = ({ title, subtitle }: Props) => {
	return (
		<div
			className={css({
				marginBottom: 8,
			})}
		>
			<h1
				className={css({
					fontSize: "4xl",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				{title}
			</h1>
			{subtitle && (
				<span className={css({ color: "gray.500", fontSize: "md" })}>
					{subtitle}
				</span>
			)}
		</div>
	);
};
