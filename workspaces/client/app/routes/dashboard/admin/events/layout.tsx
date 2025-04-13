import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { Outlet } from "react-router";
import { useRoleBlock } from "../internal/hooks/use-role-block";

export const EVENTS_ALLOWED_ROLES = [ROLE_IDS.ADMIN, ROLE_IDS.CALENDAR_EDITOR];

export default function EventsAdminLayout() {
	const shouldProceed = useRoleBlock({
		allowedRoles: EVENTS_ALLOWED_ROLES,
		redirectPath: "/admin",
	});

	if (!shouldProceed) {
		return null;
	}

	return <Outlet />;
}
