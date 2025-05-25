import { css } from "styled-system/css";
import { useDashboardInfo } from "../hooks/use-dashboard-info";

export const TodayLoggedInUsers = () => {
	const { data: dashboardInfo } = useDashboardInfo();

	const today = new Date();
	const todayLoggedInUsers =
		dashboardInfo?.filter(
			(user) =>
				user.lastLoginAt &&
				new Date(user.lastLoginAt).toDateString() === today.toDateString(),
		).length || 0;

	return (
		<p className={css({ display: "flex", alignItems: "center", gap: 2 })}>
			<span
				className={css({
					fontSize: "2xl",
					fontWeight: "bold",
					color: "green.600",
				})}
			>
				{todayLoggedInUsers} 人
			</span>
			<span>/</span>
			<span
				className={css({
					fontSize: "md",
					color: "gray.500",
				})}
			>
				{dashboardInfo?.length || 0} 人
			</span>
		</p>
	);
};
