import { css } from "styled-system/css";

interface ToastStackProps {
	children: React.ReactNode;
}

export const ToastStack = ({ children }: ToastStackProps) => {
	return (
		<div
			className={css({
				position: "fixed",
				bottom: 0,
				right: 0,
				padding: 4,
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				gap: 4,
			})}
		>
			{children}
		</div>
	);
};
