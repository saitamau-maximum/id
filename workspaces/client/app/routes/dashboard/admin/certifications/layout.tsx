import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { Outlet } from "react-router";
import { useRoleBlock } from "../internal/hooks/use-role-block";

export const CERTIFICATIONS_ALLOWED_ROLES = [ROLE_IDS.ADMIN];

export default function CertificationsAdminLayout() {
	const shouldProceed = useRoleBlock({
		allowedRoles: CERTIFICATIONS_ALLOWED_ROLES,
		redirectPath: "/admin",
	});

	if (!shouldProceed) {
		return null;
	}

	return <Outlet />;
}
