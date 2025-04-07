import { css } from "styled-system/css";

interface Props {
	title?: string;
}

export const RejectConfirmation = ({ title }: Props) => {
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
				このユーザーの招待を却下しますか？
			</p>
			<p
				className={css({
					textAlign: "center",
					color: "rose.400",
					fontWeight: "bold",
					fontSize: "sm",
				})}
			>
				登録されたユーザー情報は削除されます。もう一度招待する場合は、再度入力してもらう必要があります。
				<br />
				※この操作は取り消せません
			</p>
		</div>
	);
};
