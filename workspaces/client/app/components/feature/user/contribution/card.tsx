import { useMemo } from "react";
import { css } from "styled-system/css";
import type { Contribution } from "~/types/contribution";
import { RateCell } from "./rate-cell";

interface Props {
	isLoading?: boolean;
	weeks: Contribution;
	clip?: number;
}

export const ContributionCard = ({
	isLoading = false,
	weeks,
	clip = 7,
}: Props) => {
	const latestWeeks = useMemo(() => {
		if (weeks.length >= clip) {
			return weeks.slice(-clip);
		}
		const zeroPadded = Array.from({ length: clip - weeks.length }, () =>
			Array.from({ length: 7 }, () => ({ date: null, rate: 0 })),
		);
		return [...zeroPadded, ...weeks.slice(-clip)];
	}, [weeks, clip]);

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
				position: "relative",
				overflow: "hidden",
				lgDown: {
					gap: 1,
					padding: 2,
				},
			})}
		>
			{latestWeeks.map((week) =>
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				week.map((day, i) => <RateCell key={i} rate={day.rate} />),
			)}
			{isLoading && (
				<div
					className={css({
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
					})}
				>
					<span
						className={css({
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							color: "gray.500",
							fontSize: "xl",
						})}
					>
						Loading...
					</span>
				</div>
			)}
		</div>
	);
};
