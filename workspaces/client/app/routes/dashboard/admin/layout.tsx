import type { User } from "@idp/schema/entity/user";
import type { ComponentProps } from "react";
import { Outlet } from "react-router";
import { Tab } from "~/components/ui/tab";
import { useAuth } from "~/hooks/use-auth";
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
		isActive: (location) => location.pathname === "/admin",
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) => (USER_ALLOWED_ROLES as number[]).includes(r.id)),
		label: "Users",
		to: "/admin/users",
		isActive: (location) => location.pathname.startsWith("/admin/users"),
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) =>
				(INVITES_ALLOWED_ROLES as number[]).includes(r.id),
			),
		label: "Invites",
		to: "/admin/invites",
		isActive: (location) => location.pathname.startsWith("/admin/invites"),
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) =>
				(CERTIFICATIONS_ALLOWED_ROLES as number[]).includes(r.id),
			),
		label: "Certifications",
		to: "/admin/certifications",
		isActive: (location) =>
			location.pathname.startsWith("/admin/certifications"),
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) => (EVENTS_ALLOWED_ROLES as number[]).includes(r.id)),
		label: "Events",
		to: "/admin/events",
		isActive: (location) => location.pathname.startsWith("/admin/events"),
	},
	{
		shouldDisplay: (user: User) =>
			user.roles.some((r) =>
				(EQUIPMENTS_ALLOWED_ROLES as number[]).includes(r.id),
			),
		label: "Equipments",
		to: "/admin/equipments",
		isActive: (location) => location.pathname.startsWith("/admin/equipments"),
	},
] satisfies ({
	shouldDisplay?: (user: User) => boolean;
	label: string;
} & Omit<ComponentProps<typeof Tab.Item>, "children" | "notification">)[];

export default function AdminLayout() {
	const { user } = useAuth();
	const { data: requests } = useCertificationRequests();

	if (!user) {
		return null;
	}

	return (
		<div>
			<DashboardHeader title="Admin" subtitle="Maximum IdPの管理画面です" />
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
