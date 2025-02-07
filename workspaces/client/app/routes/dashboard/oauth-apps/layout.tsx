import { useEffect } from "react";
import { Outlet } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
import { DashboardHeader } from "../internal/components/dashboard-title";

const NAVIGATION = [
	{
		label: "Manage",
		to: "/oauth-apps",
		isActive: (location: string) => location === "/oauth-apps",
	},
	{
		label: "List",
		to: "/oauth-apps/list",
		isActive: (location: string) => location.startsWith("/oauth-apps/list"),
	},
];

export default function OAuthLayout() {
	const { isLoading, isAuthorized } = useAuth();

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
	}, [isLoading, isAuthorized]);

	if (isLoading) {
		return null;
	}

	return (
		<div>
			<DashboardHeader
				title="OAuth Apps"
				subtitle="Maximum IDP の OAuth 2.0 機能を用いたアプリケーションの管理"
			/>
			<Tab.List>
				{NAVIGATION.map((nav) => (
					<Tab.Item key={nav.to} to={nav.to} isActive={nav.isActive}>
						{nav.label}
					</Tab.Item>
				))}
			</Tab.List>
			<Outlet />
		</div>
	);
}
