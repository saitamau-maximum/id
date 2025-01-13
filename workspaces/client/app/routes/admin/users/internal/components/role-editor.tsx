import { role } from "@idp/server/shared/role";
import { useActionState, useState } from "react";
import { Edit, Save } from "react-feather";
import { css } from "styled-system/css";
import { RoleBadge } from "~/components/feature/user/role-badge";
import { Select, SelectGroup } from "~/components/ui/form/select";
import { useUpdateRole } from "../hooks/use-update-role";

interface Props {
	userId: string;
	roles: role.Role[];
}

export const RoleEditor = ({ userId, roles }: Props) => {
	const { mutate: updateRole, isPending } = useUpdateRole(userId);
	const [editing, setEditing] = useState(false);

	const [_, updateRoleAction] = useActionState(
		async (_: null, formData: FormData) => {
			const _roleIds = formData.getAll("role");
			const roleIds = _roleIds.map((id) => Number(id));
			updateRole({ roleIds });
			setEditing(false);
			return null;
		},
		null,
	);

	return (
		<div
			className={css({
				display: "flex",
				gap: 2,
				alignItems: "center",
				justifyContent: "space-between",
			})}
		>
			{!editing && (
				<div className={css({ display: "flex", gap: 2, alignItems: "center" })}>
					{isPending && "Loading..."}
					{!isPending &&
						roles.map((role) => (
							<RoleBadge key={role.id} color={role.color}>
								{role.name}
							</RoleBadge>
						))}
					<button
						type="button"
						onClick={() => setEditing((editing) => !editing)}
						className={css({
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 8,
							height: 8,
							padding: 2,
							borderRadius: "full",
							background: "transparent",
							color: "gray.400",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": {
								background: "gray.200",
							},
						})}
					>
						<Edit size={20} />
					</button>
				</div>
			)}

			{editing && (
				<form
					className={css({ display: "flex", gap: 2, alignItems: "center" })}
					action={updateRoleAction}
				>
					<SelectGroup>
						{Object.values(role.ROLE_BY_ID).map((role) => (
							<Select
								name="role"
								key={role.id}
								label={role.name}
								defaultChecked={roles.some((r) => r.id === role.id)}
								value={role.id}
							/>
						))}
					</SelectGroup>
					<button
						type="submit"
						disabled={isPending}
						className={css({
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 8,
							height: 8,
							padding: 2,
							borderRadius: "full",
							background: "transparent",
							color: "gray.400",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": {
								background: "gray.200",
							},
						})}
					>
						<Save size={20} />
					</button>
				</form>
			)}
		</div>
	);
};
