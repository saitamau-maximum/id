import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/use-auth";

interface RoleBlockProps {
	allowedRoles: number[];
	redirectPath: string;
}

export const useRoleBlock = ({
	allowedRoles,
	redirectPath,
}: RoleBlockProps) => {
	const navigate = useNavigate();

	const { user, isLoading, isAuthorized } = useAuth();

	useEffect(() => {
		if (isLoading || !isAuthorized) {
			return;
		}
		if (!user?.roles.some((role) => allowedRoles.includes(role.id))) {
			navigate(redirectPath);
		}
	}, [isLoading, isAuthorized, user, navigate, allowedRoles, redirectPath]);

	if (
		isLoading ||
		!user?.roles.some((role) => allowedRoles.includes(role.id))
	) {
		return false;
	}

	return true;
};
