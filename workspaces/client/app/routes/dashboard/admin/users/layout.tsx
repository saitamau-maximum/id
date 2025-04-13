import { ROLE_IDS } from "node_modules/@idp/server/dist/constants/role";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/hooks/use-auth";

export const USER_ALLOWED_ROLES = [
    ROLE_IDS.ADMIN,
    ROLE_IDS.ACCOUNTANT,
];

export default function UsersAdminLayout() {
    const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
		if (!user?.roles.some((role) => (USER_ALLOWED_ROLES as number[]).includes(role.id))) {
			navigate("/admin");
		}
	}, [isLoading, isAuthorized, user, navigate]);

	if (isLoading || !user?.roles.some((role) => (USER_ALLOWED_ROLES as number[]).includes(role.id))) {
		return null;
	}
    return <Outlet />;
}