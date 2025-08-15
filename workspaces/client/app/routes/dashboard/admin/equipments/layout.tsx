import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { Outlet } from "react-router";
import { useRoleBlock } from "../internal/hooks/use-role-block";

export const EQUIPMENTS_ALLOWED_ROLES = [ROLE_IDS.MEMBER];

export default function EquipmentsAdminLayout() {
	const shouldProceed = useRoleBlock({
		allowedRoles: EQUIPMENTS_ALLOWED_ROLES,
		redirectPath: "/admin",
	});

	if (!shouldProceed) {
		return null;
	}

	return <Outlet />;
}
