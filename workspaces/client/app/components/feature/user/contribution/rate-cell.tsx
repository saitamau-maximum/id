import { css } from "styled-system/css";

const RATE_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export const RateCell = ({ rate }: { rate: number }) => (
	<div
		className={css({
			width: "16px",
			height: "16px",
			borderRadius: 4,
		})}
		style={{
			backgroundColor:
				RATE_COLORS[
					Math.min(
						Math.floor(rate * RATE_COLORS.length),
						RATE_COLORS.length - 1,
					)
				],
		}}
	/>
);
