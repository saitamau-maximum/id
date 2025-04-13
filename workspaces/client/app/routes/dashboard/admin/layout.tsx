import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
import { FLAG } from "~/utils/flag";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { useCertificationRequests } from "./internal/hooks/use-certification-requests";
import type { User } from "~/types/user";
import { USER_ALLOWED_ROLES } from "./users/layout";

const NAVIGATION = [
	{
		label: "Home",
		to: "/admin",
		isActive: (location: string) => location === "/admin",
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) => (USER_ALLOWED_ROLES as number[]).includes(r.id)),
		label: "Users",
		to: "/admin/users",
		isActive: (location: string) => location.startsWith("/admin/users"),
	},
	...(FLAG.ENABLE_INVITE
		? [
				{
					label: "Invites",
					to: "/admin/invites",
					isActive: (location: string) => location.startsWith("/admin/invites"),
				},
			]
		: []),
	{
		label: "Certifications",
		to: "/admin/certifications",
		isActive: (location: string) =>
			location.startsWith("/admin/certifications"),
	},
	...(FLAG.ENABLE_CALENDAR
		? [
				{
					label: "Events",
					to: "/admin/events",
					isActive: (location: string) => location.startsWith("/admin/events"),
				},
			]
		: []),
];

export default function AdminLayout() {
	const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();
	const { data: requests } = useCertificationRequests();

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
	}, [isLoading, isAuthorized]);

	if (isLoading || !user?.roles.some((role) => role.id === ROLE_IDS.MEMBER)) {
		return null;
	}

	return (
		<div>
			<DashboardHeader title="Admin" subtitle="Maximum IDPの管理画面です" />
			<Tab.List>
				{NAVIGATION.map((nav) => (
					(!nav.shouldDisplay || nav.shouldDisplay(user)) && (
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
				)))}
			</Tab.List>
			<Outlet />
		</div>
	);
}
