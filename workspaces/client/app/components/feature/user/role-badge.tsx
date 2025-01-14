import { css } from "styled-system/css";

interface Props {
	color: string;
	children: React.ReactNode;
}

export const RoleBadge = ({ color, children }: Props) => {
	return (
		<span
			className={css({
				display: "inline-block",
				padding: "token(spacing.1) token(spacing.2)",
				lineHeight: 1,
				borderRadius: 8,
				fontSize: 12,
				fontWeight: 500,
			})}
			style={{
				backgroundColor: `${color}22`,
				border: `1px solid ${color}`,
				color,
			}}
		>
			{children}
		</span>
	);
};
