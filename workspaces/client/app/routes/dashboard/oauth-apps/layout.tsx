import { Outlet } from "react-router";
import { DashboardHeader } from "../internal/components/dashboard-title";

export default function OAuthLayout() {
	return (
		<div>
			<DashboardHeader
				title="OAuth Apps"
				subtitle="Maximum IDP の OAuth 2.0 機能を用いたアプリケーションの管理"
			/>
			<Outlet />
		</div>
	);
}
