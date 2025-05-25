import { Line } from "react-chartjs-2";
import { useDashboardInfo } from "../hooks/use-dashboard-info";
import "chart.js/auto";
import type { DashboardUser } from "~/types/user";

const createMemberSegmentsByDate = (data: DashboardUser[], now: Date) => {
	// 直近50日のユーザー登録数を日付ごとに集計する
	const segments: { date: string; count: number }[] = [];
	const dataSet = new Set<DashboardUser>(data);
	const startDate = new Date(now);
	startDate.setDate(now.getDate() - 50); // 直近50日
	let cnt = 0;
	for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toLocaleDateString();
		for (const user of dataSet) {
			if (
				!user.isProvisional &&
				user.initializedAt &&
				user.initializedAt <= d
			) {
				cnt++;
				dataSet.delete(user); // 一度カウントしたユーザーは削除
			}
		}
		segments.push({ date: dateStr, count: cnt });
	}
	return segments;
};

const createProvisionalSegmentsByDate = (data: DashboardUser[], now: Date) => {
	// 直近50日のユーザー登録数を日付ごとに集計する
	const segments: { date: string; count: number }[] = [];
	const dataSet = new Set<DashboardUser>(data);
	const startDate = new Date(now);
	startDate.setDate(now.getDate() - 50); // 直近50日
	let cnt = 0;
	for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toLocaleDateString();
		for (const user of dataSet) {
			if (user.isProvisional && user.initializedAt && user.initializedAt <= d) {
				cnt++;
				dataSet.delete(user); // 一度カウントしたユーザーは削除
			}
		}
		segments.push({ date: dateStr, count: cnt });
	}
	return segments;
};

export const UsersTransitionGraph = () => {
	const { data: info } = useDashboardInfo();

	const memberSegments = createMemberSegmentsByDate(info || [], new Date());
	const provisionalSegments = createProvisionalSegmentsByDate(
		info || [],
		new Date(),
	);

	return (
		<Line
			data={{
				labels: memberSegments.map((segment) =>
					new Date(segment.date).toLocaleDateString("ja-JP", {
						month: "numeric",
						day: "numeric",
					}),
				),
				datasets: [
					{
						label: "仮登録ユーザー",
						data: provisionalSegments.map((segment) => segment.count),
						fill: false,
					},
					{
						label: "メンバー",
						data: memberSegments.map((segment) => segment.count),
						fill: false,
					},
				],
			}}
			options={{
				responsive: true,
				scales: {
					y: {
						stacked: true,
						ticks: {
							stepSize: 1,
							precision: 0,
						},
						beginAtZero: true,
					},
				},
			}}
		/>
	);
};
