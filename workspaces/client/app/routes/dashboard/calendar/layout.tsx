
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { LEADER_ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";


const NAVIGATION = [
	{
		label: "View",
		to: "/calendar",
		isActive: (location: string) => location === "/calendar",
	},
	{
		label: "Edit",
		to: "/calendar/edit",
		isActive: (location: string) => location.startsWith("/calendar/edit"),
	},
];

export default function AdminLayout() {
	const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();
	const [isTabVisible, setIsTabVisible] = useState(false);

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
		// リーダーロールがない場合、/calendarにリダイレクト
		if (!user?.roles.some((role) => (Object.values(LEADER_ROLE_IDS) as number[]).includes(role.id))) {
			setIsTabVisible(false);
			navigate("/calendar"); // 条件を満たさない場合、/calendarにリダイレクト
		} else {
			setIsTabVisible(true);
		}
	}, [isLoading, isAuthorized, user, navigate]);

	return (
		<div>
			<DashboardHeader
				title="Maximum Calendar"
				subtitle="サークルの講習会やイベントなどの予定を確認できます"
			/>
			{isTabVisible && (
				<Tab.List>
					{NAVIGATION.map((nav) => (
						<Tab.Item key={nav.to} to={nav.to} isActive={nav.isActive}>
							{nav.label}
						</Tab.Item>
					))}
				</Tab.List>
			)}
			<Outlet />
		</div>
	);
}
