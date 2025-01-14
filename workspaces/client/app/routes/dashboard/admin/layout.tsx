import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useAuth } from "~/hooks/use-auth";
import { DashboardHeader } from "../internal/components/dashboard-title";

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
];

export default function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();

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
