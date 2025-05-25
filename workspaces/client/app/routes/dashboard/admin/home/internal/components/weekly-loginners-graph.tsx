import { Line } from "react-chartjs-2";
import { useDashboardInfo } from "../hooks/use-dashboard-info";

export const WeeklyLoginnersGraph = () => {
	const { data: dashboardInfo } = useDashboardInfo();

	const week = new Map<string, number>();
	const userSet = new Set(dashboardInfo);
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 6); // 過去7日間を対象
	for (let i = 0; i < 7; i++) {
		const date = new Date(startDate);
		date.setDate(date.getDate() + i);
		week.set(date.toISOString().split("T")[0], 0); // YYYY-MM-DD形式のキーで初期化
	}
	for (const user of userSet) {
		if (user.lastLoginAt) {
			const lastLoginDate = new Date(user.lastLoginAt);
			if (lastLoginDate >= startDate) {
				const weekKey = lastLoginDate.toISOString().split("T")[0]; // YYYY-MM-DD形式のキー
				const found = week.get(weekKey);
				if (found !== undefined) {
					week.set(weekKey, found + 1); // 週ごとのログイン数をカウント
					userSet.delete(user); // 重複を避けるためにセットから削除
				}
			}
		}
	}

	return (
		<Line
			data={{
				labels: Array.from(week.keys()).sort(),
				datasets: [
					{
						label: "Users",
						data: Array.from(week.values()).sort(),
						borderWidth: 1,
						borderColor: "#4CAF50",
						backgroundColor: "rgba(76, 175, 80, 0.2)",
					},
				],
			}}
			options={{
				responsive: true,
				scales: {
					y: {
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
