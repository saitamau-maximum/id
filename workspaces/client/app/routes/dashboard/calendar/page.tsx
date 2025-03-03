import { FLAG } from "~/utils/flag";
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
				{/* TODO: イベントの取得はできているが、日時でのソートやデザインをあてる必要あり */}
				{FLAG.CALENDAR_FLAGS &&
					data.map((event) => (
						<div key={event.id}>
							<p>タイトル：{event.title}</p>
							<p>説明：{event.description}</p>
							<p>開始：{event.startAt}</p>
							<p>終了：{event.endAt}</p>
						</div>
					))}
			</div>
		</div>
	);
}
