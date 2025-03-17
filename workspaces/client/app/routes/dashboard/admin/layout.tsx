import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { useCertificationRequests } from "./internal/hooks/use-certification-requests";

const NAVIGATION = [
	{
		label: "Home",
		to: "/admin",
		isActive: (location: string) => location === "/admin",
	},
	{
		label: "Users",
		to: "/admin/users",
		isActive: (location: string) => location.startsWith("/admin/users"),
	},
	{
		label: "Certifications",
		to: "/admin/certifications",
		isActive: (location: string) =>
			location.startsWith("/admin/certifications"),
	},
	{
		label: "Events",
		to: "/admin/events",
		isActive: (location: string) => location.startsWith("/admin/events"),
	},
];

export default function AdminLayout() {
	const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();
	const { data: requests } = useCertificationRequests();

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
		if (!user?.roles.some((role) => role.id === ROLE_IDS.ADMIN)) {
			navigate("/");
		}
	}, [isLoading, isAuthorized, user, navigate]);

	if (isLoading || !user?.roles.some((role) => role.id === ROLE_IDS.ADMIN)) {
		return null;
	}

	return (
		<div>
			<DashboardHeader title="Admin" subtitle="Maximum IDPの管理画面です" />
			<Tab.List>
				{NAVIGATION.map((nav) => (
					<Tab.Item
						key={nav.to}
						to={nav.to}
						isActive={nav.isActive}
						notification={
							nav.label === "Certifications" ? requests.length : undefined
						}
					>
						{nav.label}
					</Tab.Item>
				))}
			</Tab.List>
			<Outlet />
		</div>
	);
}
