import { Bar } from "react-chartjs-2";
import { useDashboardInfo } from "../hooks/use-dashboard-info";
import "chart.js/auto";
import { ROLE_BY_ID, ROLE_IDS } from "~/types/role";

export const RoleCountsGraph = () => {
	const { data: info } = useDashboardInfo();

	const roleCounts = new Map<number, number>(
		Object.values(ROLE_IDS).map((roleId) => [roleId, 0]),
	);
	for (const user of info || []) {
		for (const role of user.roles) {
			const roleCount = roleCounts.get(role.id);
			if (roleCount !== undefined) {
				roleCounts.set(role.id, roleCount + 1);
			}
		}
	}

	const sortedRoleCounts = Array.from(roleCounts.entries()).sort(
		(a, b) => b[1] - a[1],
	);

	return (
		<Bar
			data={{
				labels: sortedRoleCounts.map(
					(role) => ROLE_BY_ID[role[0]]?.name || "Unknown Role",
				),
				datasets: [
					{
						label: "Role Counts",
						data: sortedRoleCounts.map((role) => role[1]),
						borderWidth: 1,
						borderColor: sortedRoleCounts.map(
							(role) => ROLE_BY_ID[role[0]]?.color || "#ccc",
						),
						backgroundColor: sortedRoleCounts.map(
							(role) => `${ROLE_BY_ID[role[0]]?.color}66` || "#ccc6",
						),
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
					x: {
						ticks: {
							autoSkip: false,
							maxRotation: 45,
							minRotation: 45,
						},
					},
				},
			}}
		/>
	);
};
