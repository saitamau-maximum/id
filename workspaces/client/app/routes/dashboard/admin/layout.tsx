import { Outlet } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
import type { User } from "~/types/user";
import { FLAG } from "~/utils/flag";
import { DashboardHeader } from "../internal/components/dashboard-title";
import { CERTIFICATIONS_ALLOWED_ROLES } from "./certifications/layout";
import { EQUIPMENTS_ALLOWED_ROLES } from "./equipments/layout";
import { EVENTS_ALLOWED_ROLES } from "./events/layout";
import { useCertificationRequests } from "./internal/hooks/use-certification-requests";
import { INVITES_ALLOWED_ROLES } from "./invites/layout";
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
					shouldDisplay: (user: User) =>
						user.roles.some((r) =>
							(INVITES_ALLOWED_ROLES as number[]).includes(r.id),
						),
					label: "Invites",
					to: "/admin/invites",
					isActive: (location: string) => location.startsWith("/admin/invites"),
				},
			]
		: []),
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) =>
				(CERTIFICATIONS_ALLOWED_ROLES as number[]).includes(r.id),
			),
		label: "Certifications",
		to: "/admin/certifications",
		isActive: (location: string) =>
			location.startsWith("/admin/certifications"),
	},
	...(FLAG.ENABLE_CALENDAR
		? [
				{
					shouldDisplay: (user: User) =>
						user.roles.some((r) =>
							(EVENTS_ALLOWED_ROLES as number[]).includes(r.id),
						),
					label: "Events",
					to: "/admin/events",
					isActive: (location: string) => location.startsWith("/admin/events"),
				},
			]
		: []),
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) =>
				(EQUIPMENTS_ALLOWED_ROLES as number[]).includes(r.id),
			),
		label: "Equipments",
		to: "/admin/equipments",
		isActive: (location: string) => location.startsWith("/admin/equipments"),
	},
];

export default function AdminLayout() {
	const { user } = useAuth();
	const { data: requests } = useCertificationRequests();

	if (!user) {
		return null;
	}

	return (
		<div>
			<DashboardHeader title="Admin" subtitle="Maximum IDPの管理画面です" />
			<Tab.List>
				{NAVIGATION.map(
					(nav) =>
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
						),
				)}
			</Tab.List>
			<Outlet />
		</div>
	);
}
