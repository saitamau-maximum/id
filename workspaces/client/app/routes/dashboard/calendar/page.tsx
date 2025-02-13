import { css } from "styled-system/css";

export default function Calendar() {

	return (
		<div
			className={css({
				width: "100%",
				maxWidth: "1200px",
				marginTop: 32,
				display: "grid",
				gridTemplateColumns: "repeat(2, max-content)",
				justifyContent: "center",
				placeItems: "center",
				gap: 16,
				lgDown: {
					gridTemplateColumns: "repeat(1, 1fr)",
				},
			})}
		>
			<h1
				className={css({
					fontSize: "2xl",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				Calendar
			</h1>
		</div>
	);
}
