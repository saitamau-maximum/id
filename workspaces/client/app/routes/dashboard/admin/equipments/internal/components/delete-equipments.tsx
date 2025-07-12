import { css } from "styled-system/css";

interface Props {
	title?: string;
}

export const DeleteEquipment = ({ title }: Props) => {
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
				備品情報を削除しますか？
			</p>
		</div>
	);
};
