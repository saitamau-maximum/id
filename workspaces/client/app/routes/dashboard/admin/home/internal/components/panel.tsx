import type { ReactNode } from "react";
import { css } from "styled-system/css";

interface Props {
	title: string;
	description?: string;
	children: ReactNode;
}

export const Panel = ({ title, description, children }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 4,
			})}
		>
			<div
				className={css({
					marginBottom: 2,
				})}
			>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					{title}
				</h2>
				{description && (
					<p
						className={css({
							fontSize: "md",
							color: "gray.500",
						})}
					>
						{description}
					</p>
				)}
			</div>
			{children}
		</div>
	);
};
