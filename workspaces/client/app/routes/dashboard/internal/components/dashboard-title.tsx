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
					fontSize: {
						base: "2xl",
						"@dashboard/xl": "3xl",
						"@dashboard/4xl": "4xl",
					},
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				{title}
			</h1>
			{subtitle && (
				<span
					className={css({
						color: "gray.500",
						fontSize: {
							base: "sm",
							"@dashboard/xl": "md",
							"@dashboard/4xl": "lg",
						},
					})}
				>
					{subtitle}
				</span>
			)}
		</div>
	);
};
