import { css } from "styled-system/css";
import { Calendar } from "~/components/feature/calendar/calendar";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { useCalendar } from "./hooks/use-calendar";

export default function CalendarHome() {
	const { data } = useCalendar();

	if (!data) {
		return null;
	}

	return (
		<div>
			<DashboardHeader
				title="Maximum Calendar"
				subtitle="サークルの講習会やイベントなどの予定を確認できます"
			/>
			<div
				className={css({
					display: "flex",
					justifyContent: "center",
					marginTop: 24,
				})}
			>
				<div className={css({ width: 400 })}>
					<Calendar events={data} label="Event Calendar" />
				</div>
			</div>
			{data.map((event) => (
				<pre key={event.id}>{JSON.stringify(event, null, 2)}</pre>
			))}
		</div>
	);
}
