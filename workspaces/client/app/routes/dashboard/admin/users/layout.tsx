import { ROLE_IDS } from "@idp/schema/entity/role";
import { Outlet } from "react-router";
import { useRoleBlock } from "../internal/hooks/use-role-block";

export const USER_ALLOWED_ROLES = [ROLE_IDS.ADMIN, ROLE_IDS.ACCOUNTANT];

export default function UsersAdminLayout() {
	const shouldProceed = useRoleBlock({
		allowedRoles: USER_ALLOWED_ROLES,
		redirectPath: "/admin",
	});

	if (!shouldProceed) {
		return null;
	}

	return <Outlet />;
}
