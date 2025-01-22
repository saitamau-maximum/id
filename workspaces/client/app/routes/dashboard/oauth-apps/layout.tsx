import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { css } from "styled-system/css";
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

export default function AdminLayout() {
	const location = useLocation();

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
			<div
				className={css({
					display: "flex",
					marginBottom: 8,
					borderBottomWidth: "2px",
					borderColor: "gray.200",
				})}
			>
				{NAVIGATION.map((nav) => (
					<Link
						key={nav.to}
						to={nav.to}
						className={css({
							cursor: "pointer",
							padding: "token(spacing.2) token(spacing.4)",
							position: "relative",
							transition: "background",
							_after: {
								content: "''",
								position: "absolute",
								top: "100%",
								left: 0,
								width: "100%",
								height: "2px",
								backgroundColor: nav.isActive(location.pathname)
									? "green.500"
									: "transparent",
								transition: "background",
							},
							_hover: {
								backgroundColor: "gray.100",
							},
						})}
					>
						{nav.label}
					</Link>
				))}
			</div>
			<Outlet />
		</div>
	);
}
