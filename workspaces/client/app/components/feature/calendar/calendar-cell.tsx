import { css } from "styled-system/css";
import type { CalendarEvent } from "~/types/event";
import type { TCalendarCell } from "./types";

interface CellProps {
	cell: TCalendarCell;
	events: CalendarEvent[];
	onDateClick?: (date: Date) => void;
}

export const CalendarCell = ({ cell, events, onDateClick }: CellProps) => {
	const cellEvents = events.filter((event) => {
		if (cell.type === "empty") return false;
		const cellDate = `${cell.year}${String(cell.month + 1).padStart(2, "0")}${String(cell.day).padStart(2, "0")}`;
		const eventStartDate = `${event.startAt.getFullYear()}${String(event.startAt.getMonth() + 1).padStart(2, "0")}${String(event.startAt.getDate()).padStart(2, "0")}`;
		const eventEndDate = `${event.endAt.getFullYear()}${String(event.endAt.getMonth() + 1).padStart(2, "0")}${String(event.endAt.getDate()).padStart(2, "0")}`;

		return eventStartDate <= cellDate && cellDate <= eventEndDate;
	});

	const isToday =
		cell.type === "day" &&
		new Date().getFullYear() === cell.year &&
		new Date().getMonth() === cell.month &&
		new Date().getDate() === cell.day;

	const hasEvent = cellEvents.length > 0;

	return (
		<td
			className={css({
				color: "gray.600",
				textAlign: "center",
				width: "fit-content",
				padding: 1,
			})}
		>
			{cell.type === "empty" ? null : (
				<button
					type="button"
					className={css({
						width: "40px",
						height: "40px",
						display: "grid",
						placeItems: "center",
						borderRadius: "50%",
						backgroundColor: isToday
							? "green.500"
							: hasEvent
								? "green.200"
								: "transparent",
						color: isToday ? "white" : "gray.500",
						fontWeight: "bold",
						transition: "colors",
						cursor: "pointer",

						_hover: {
							backgroundColor: isToday
								? "green.600"
								: hasEvent
									? "green.300"
									: "gray.100",
						},
					})}
					onClick={() => {
						if (cell.type === "day" && onDateClick) {
							onDateClick(new Date(cell.year, cell.month, cell.day));
						}
					}}
				>
					{cell.label}
				</button>
			)}
		</td>
	);
};
