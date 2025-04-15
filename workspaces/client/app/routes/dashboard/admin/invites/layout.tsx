import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { Outlet } from "react-router";
import { useRoleBlock } from "../internal/hooks/use-role-block";

export const INVITES_ALLOWED_ROLES = [ROLE_IDS.ADMIN, ROLE_IDS.ACCOUNTANT];

export default function InvitesAdminLayout() {
	const shouldProceed = useRoleBlock({
		allowedRoles: INVITES_ALLOWED_ROLES,
		redirectPath: "/admin",
	});

	if (!shouldProceed) {
		return null;
	}

	return <Outlet />;
}
