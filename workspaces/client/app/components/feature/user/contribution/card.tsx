import { useMemo } from "react";
import { css } from "styled-system/css";
import { RateCell } from "./rate-cell";

interface Props {
	weeks: {
		date: Date;
		rate: number;
	}[][];
	clip?: number;
}

export const ContributionCard = ({ weeks, clip = 7 }: Props) => {
	const latestWeeks = useMemo(() => weeks.slice(-clip), [weeks, clip]);
	return (
		<div
			className={css({
				display: "grid",
				gridTemplateColumns: "repeat((auto-fill, 1fr)",
				gridTemplateRows: "repeat(7, 1fr)",
				gridAutoFlow: "column",
				gap: 2,
				padding: 4,
				backgroundColor: "gray.50",
				borderRadius: 8,
				lgDown: {
					gap: 1,
					padding: 2,
				},
			})}
		>
			{latestWeeks.map((week) =>
				week.map((day) => (
					<RateCell key={day.date.toISOString()} rate={day.rate} />
				)),
			)}
		</div>
	);
};
