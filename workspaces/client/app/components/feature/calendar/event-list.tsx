import { useCallback } from "react";
import { css } from "styled-system/css";
import type { CalendarEvent } from "~/types/event";

interface Props {
	events: CalendarEvent[];
}

// あくまでも表示用のコンポーネントなので、ソートやフィルタなどの処理は行わない
export const EventList = ({ events }: Props) => {
	const formatTerm = (startAt: Date, endAt: Date) => {
		if (startAt.getDate() === endAt.getDate()) {
			const startTimestamp = startAt.toLocaleTimeString("ja-JP", {
				hour: "2-digit",
				minute: "2-digit",
			});
			const endTimestamp = endAt.toLocaleTimeString("ja-JP", {
				hour: "2-digit",
				minute: "2-digit",
			});
			const date = startAt.toLocaleDateString("ja-JP", {
				month: "2-digit",
				day: "2-digit",
				weekday: "short",
			});
			return `${date} ${startTimestamp} - ${endTimestamp}`;
		}
		return `${startAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
		})} - ${endAt.toLocaleDateString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	};

	const isActiveEvent = useCallback((event: CalendarEvent) => {
		const now = new Date();
		return event.startAt <= now && now <= event.endAt;
	}, []);

	return (
		<div>
			{events.map((event) => (
				<div
					key={event.id}
					className={css({
						position: "relative",
						paddingLeft: 8,
						paddingBottom: 2,
						_before: {
							content: '""',
							position: "absolute",
							left: 4,
							top: 4,
							transform: "translateX(-50%)",
							width: "2px",
							height: "100%",
							backgroundColor: "gray.300",
						},
						_last: {
							_before: {
								display: "none",
							},
						},
						_after: {
							content: '""',
							position: "absolute",
							left: 4,
							top: 4,
							transform: "translate(-50%, -50%)",
							width: isActiveEvent(event) ? "12px" : "8px",
							height: isActiveEvent(event) ? "12px" : "8px",
							borderRadius: "50%",
							backgroundColor: isActiveEvent(event) ? "green.600" : "gray.400",
							animation: isActiveEvent(event)
								? "pulseShadow 5s infinite"
								: "none",
						},
					})}
				>
					<div
						className={css({
							display: "flex",
							gap: 2,
							marginBottom: 1,
							alignItems: "center",
						})}
					>
						<span
							className={css({
								color: "gray.700",
								fontSize: "lg",
								fontWeight: 500,
							})}
						>
							{event.title}
						</span>
						<span
							className={css({
								color: "gray.500",
								fontSize: "sm",
							})}
						>
							{formatTerm(event.startAt, event.endAt)}
						</span>
					</div>
					<div
						className={css({
							color: "gray.500",
							fontSize: "sm",
						})}
					>
						{event.description}
					</div>
				</div>
			))}
		</div>
	);
};
