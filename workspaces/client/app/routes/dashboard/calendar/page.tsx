import { DashboardHeader } from "../internal/components/dashboard-title";
import { useCalendar } from "./hooks/use-calendar";

export default function Calendar() {
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
			<div>
				{data.map((event) => (
					<div key={event.id}>
						<p>{event.title}</p>
						<p>{event.description}</p>
						<p>{event.startAt}</p>
						<p>{event.endAt}</p>
					</div>
				))}
			</div>
		</div>
	);
}
