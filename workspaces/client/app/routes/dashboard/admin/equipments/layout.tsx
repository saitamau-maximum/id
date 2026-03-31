import { ROLE_IDS } from "@idp/schema/entity/role";
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
