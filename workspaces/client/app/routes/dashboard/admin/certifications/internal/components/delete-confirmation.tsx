import { css } from "styled-system/css";

interface Props {
	title?: string;
}

export const DeleteConfirmation = ({ title }: Props) => {
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
					「{title}」
				</h2>
			)}
			<p
				className={css({
					textAlign: "center",
				})}
			>
				本当に削除しますか？
			</p>
			<p
				className={css({
					textAlign: "center",
					color: "rose.400",
					fontWeight: "bold",
					fontSize: "sm",
				})}
			>
				※この操作は取り消せません
			</p>
		</div>
	);
};
