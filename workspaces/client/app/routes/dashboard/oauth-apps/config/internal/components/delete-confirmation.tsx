import { css } from "styled-system/css";

export const DeleteConfirmation = () => {
	return (
		<div className={css({ display: "flex", flexDirection: "column" })}>
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
