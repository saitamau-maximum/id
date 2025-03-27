import { css } from "styled-system/css";

export default function AdminHome() {
	return (
		<div>
			<div
				className={css({
					textAlign: "center",
					fontSize: "2xl",
					fontWeight: "bold",
					color: "gray.600",
					marginTop: 32,
				})}
			>
				なんかかっこいいダッシュボード
			</div>
		</div>
	);
}
