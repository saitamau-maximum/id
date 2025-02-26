import { css } from "styled-system/css";

interface Props {
	children: React.ReactNode;
}

export const SwitchList = ({ children }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				padding: "token(spacing.1) token(spacing.2)",
				gap: 2,
			})}
		>
			{children}
		</div>
	);
};
