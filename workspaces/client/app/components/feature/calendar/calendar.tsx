import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { css } from "styled-system/css";
import type { CalendarEvent } from "~/types/event";

interface Props {
	label: string;
	events: CalendarEvent[];
	onDateClick?: (date: Date) => void;
}

type Calendar = {
	year: number;
	month: number;
};

const MONTH_IDX_JAN = 0;
const MONTH_IDX_DEC = 11;

type Cell =
	| {
			type: "day";
			year: number;
			month: number;
			day: number;
			idx: number;
			label?: string;
	  }
	| {
			type: "empty";
			idx: number;
	  };

type Row = {
	id: string;
	cells: Cell[];
};

const SUNDAY = "日";
const MONDAY = "月";
const TUESDAY = "火";
const WEDNESDAY = "水";
const THURSDAY = "木";
const FRIDAY = "金";
const SATURDAY = "土";
const WEEKDAYS = [
	SUNDAY,
	MONDAY,
	TUESDAY,
	WEDNESDAY,
	THURSDAY,
	FRIDAY,
	SATURDAY,
];

const controllerButtonStyle = css({
	width: "40px",
	height: "40px",
	backgroundColor: "transparent",
	border: "none",
	cursor: "pointer",
	display: "grid",
	placeItems: "center",
	color: "gray.600",
	transition: "colors",
	borderRadius: "50%",

	_hover: {
		backgroundColor: "gray.100",
	},
});

export const Calendar = ({ label, events, onDateClick }: Props) => {
	const [displayedCalendar, setDisplayedCalendar] = useState<Calendar>({
		year: new Date().getFullYear(),
		month: new Date().getMonth(),
	});

	const previousMonth = useCallback(() => {
		setDisplayedCalendar((prev) => {
			if (prev.month === MONTH_IDX_JAN) {
				return { year: prev.year - 1, month: MONTH_IDX_DEC };
			}
			return { ...prev, month: prev.month - 1 };
		});
	}, []);

	const nextMonth = useCallback(() => {
		setDisplayedCalendar((prev) => {
			if (prev.month === MONTH_IDX_DEC) {
				return { year: prev.year + 1, month: MONTH_IDX_JAN };
			}
			return { ...prev, month: prev.month + 1 };
		});
	}, []);

	const displayWeeks = useMemo(() => {
		const weeks: Row[] = [];
		const firstDay = new Date(
			displayedCalendar.year,
			displayedCalendar.month,
			1,
		);
		const lastDay = new Date(
			displayedCalendar.year,
			displayedCalendar.month + 1,
			0,
		);
		const firstDayWeek = firstDay.getDay();
		const lastDate = lastDay.getDate();
		const lastDateWeek = lastDate + firstDayWeek;

		let week: Row = { id: "0", cells: [] };
		for (let i = 0; i < lastDateWeek; i++) {
			if (i < firstDayWeek) {
				week.cells.push({
					type: "empty",
					idx: i,
				});
			} else {
				week.cells.push({
					type: "day",
					year: displayedCalendar.year,
					month: displayedCalendar.month,
					day: i - firstDayWeek + 1,
					idx: i,
					label: `${i - firstDayWeek + 1}`,
				});
			}

			if (i === lastDateWeek - 1) {
				weeks.push(week);
			} else if (week.cells.length === 7) {
				weeks.push(week);
				week = { id: `${weeks.length}`, cells: [] };
			}
		}

		return weeks;
	}, [displayedCalendar]);

	const calendarLabel = useMemo(() => {
		return `${displayedCalendar.year}年${displayedCalendar.month + 1}月`;
	}, [displayedCalendar]);

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 2,
				alignItems: "center",
				width: "fit-content",
			})}
			aria-label={label}
		>
			<header
				className={css({
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				})}
			>
				<span
					className={css({
						fontSize: "lg",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					{calendarLabel}
				</span>
				<div className={css({ display: "flex", gap: 1 })}>
					<button
						type="button"
						className={controllerButtonStyle}
						onClick={previousMonth}
					>
						<ChevronLeft />
					</button>
					<button
						type="button"
						className={controllerButtonStyle}
						onClick={nextMonth}
					>
						<ChevronRight />
					</button>
				</div>
			</header>
			<table className={css({ width: "fit-content" })}>
				<thead>
					<tr>
						{WEEKDAYS.map((day) => (
							<th
								key={day}
								className={css({
									textAlign: "center",
									color:
										day === SUNDAY
											? "red.500"
											: day === SATURDAY
												? "blue.500"
												: "gray.600",
								})}
							>
								{day}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{displayWeeks.map((week) => (
						<tr key={week.id}>
							{week.cells.map((cell) => (
								<CalendarCell
									key={cell.idx}
									cell={cell}
									events={events}
									onDateClick={onDateClick}
								/>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

interface CellProps {
	cell: Cell;
	events: CalendarEvent[];
	onDateClick?: (date: Date) => void;
}

const CalendarCell = ({ cell, events, onDateClick }: CellProps) => {
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
