import { useCallback, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "react-feather";
import { css } from "styled-system/css";
import { Calendar } from "~/components/feature/calendar/calendar";
import { EventList } from "~/components/feature/calendar/event-list";
import { InformationDialog } from "~/components/logic/callable/information";
import { ButtonLike } from "~/components/ui/button-like";
import { useDeviceType } from "~/hooks/use-device-type";
import { ICalDisplay } from "./components/ical-display";
import { useCalendar } from "./hooks/use-calendar";

const formatYYYYMMDD = (date: Date) =>
	`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
		date.getDate(),
	).padStart(2, "0")}`;

export default function CalendarHome() {
	const { deviceType } = useDeviceType();
	const { data, generateICalUrl } = useCalendar();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	// 今日以降のイベントを今日に近い方から6つ表示する
	const displayEvents = useMemo(() => {
		if (!data) {
			return [];
		}
		if (!selectedDate) {
			const now = new Date();
			const now0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const sorted = data
				.filter((event) => event.startAt.getTime() >= now0.getTime())
				.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
			return sorted.slice(0, 5);
		}
		// selectedDate が指定されている場合はその日が期間に含まれるイベントを表示
		// YYYYMMDDにすると辞書順として判定可能
		const selectedDateStr = formatYYYYMMDD(selectedDate);
		const filtered = data.filter(
			(event) =>
				formatYYYYMMDD(event.startAt) <= selectedDateStr &&
				formatYYYYMMDD(event.endAt) >= selectedDateStr,
		);
		return filtered;
	}, [data, selectedDate]);

	const handleAddToOwnCalendar = useCallback(async () => {
		const url = await generateICalUrl();
		await InformationDialog.call({
			title: "自身のカレンダーに追加",
			children: <ICalDisplay url={url} />,
		});
	}, [generateICalUrl]);

	if (!data) {
		return null;
	}

	return (
		<div>
			<div
				className={css({
					display: "flex",
					justifyContent: "center",
					flexDirection: "column",
					alignItems: "center",
					gap: 4,
					marginTop: {
						base: 0,
						md: 24,
					},
					maxWidth: 1024,
					width: "100%",
					margin: "0 auto",

					"@dashboard/3xl": {
						flexDirection: "row",
						alignItems: "flex-start",
						gap: 8,
					},
				})}
			>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						gap: 4,
					})}
				>
					<Calendar
						events={data}
						label="Event Calendar"
						onDateClick={(date) => setSelectedDate(date)}
						targetDate={selectedDate ?? undefined}
						variant={deviceType === "pc" ? "md" : "sm"}
					/>
					<button type="button" onClick={handleAddToOwnCalendar}>
						<ButtonLike size="sm" variant="text">
							自分のカレンダーに追加
							<ArrowUpRight size={16} />
						</ButtonLike>
					</button>
				</div>
				<div className={css({ width: "100%" })}>
					<div
						className={css({
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 4,
						})}
					>
						<div>
							<h2
								className={css({
									fontSize: {
										base: "md",
										md: "xl",
									},
									color: "gray.700",
									fontWeight: "bold",
								})}
							>
								{selectedDate ? "活動予定" : "直近の活動予定"}
							</h2>
							{selectedDate && (
								<p
									className={css({
										color: "gray.500",
										fontSize: "sm",
									})}
								>
									{selectedDate.toLocaleDateString("ja-JP", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							)}
						</div>
						{selectedDate !== null && (
							<button type="button" onClick={() => setSelectedDate(null)}>
								<ButtonLike size="sm" variant="text">
									直近の予定を表示
									<ArrowRight size={16} />
								</ButtonLike>
							</button>
						)}
					</div>
					{displayEvents.length === 0 ? (
						<p
							className={css({
								color: "gray.500",
							})}
						>
							{selectedDate ? "予定はありません" : "直近の予定はありません"}
						</p>
					) : (
						<EventList events={displayEvents} />
					)}
				</div>
			</div>
		</div>
	);
}
