import { css } from "styled-system/css";

interface Props {
	title?: string;
}

export const ApproveConfirmation = ({ title }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				margin: "token(spacing.8) 0",
			})}
		>
			{title && (
				<h2
					className={css({
						textAlign: "center",
						fontWeight: "bold",
						fontSize: "xl",
						marginBottom: "token(spacing.4)",
					})}
				>
					{title}
				</h2>
			)}
			<p
				className={css({
					textAlign: "center",
				})}
			>
				このユーザーを承認しますか？
			</p>
		</div>
	);
};
