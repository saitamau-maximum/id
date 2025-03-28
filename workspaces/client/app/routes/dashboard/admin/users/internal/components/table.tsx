import { useCallback } from "react";
import { Edit } from "react-feather";
import { css } from "styled-system/css";
import { RoleBadge } from "~/components/feature/user/role-badge";
import { RoleSelector } from "~/components/feature/user/role-selector";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { RoleId } from "~/types/role";
import type { User } from "~/types/user";
import { useAllUsers } from "../hooks/use-all-user";
import { useUpdateRole } from "../hooks/use-update-role";

export const UsersTable = () => {
	const { data: users } = useAllUsers();

	return (
		<Table.Root>
			<thead>
				<Table.Tr>
					<Table.Th>表示名</Table.Th>
					<Table.Th>Display ID</Table.Th>
					<Table.Th>本名</Table.Th>
					<Table.Th>Email</Table.Th>
					<Table.Th>学籍番号</Table.Th>
					<Table.Th>学年</Table.Th>
					<Table.Th>ロール</Table.Th>
				</Table.Tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<UserTableRow key={user.id} user={user} />
				))}
			</tbody>
		</Table.Root>
	);
};

const UserTableRow = ({
	user,
}: {
	user: User;
}) => {
	const { mutate: updateRole } = useUpdateRole(user.id);

	const editRole = useCallback(async () => {
		const res = await RoleSelector.call({
			selectedRoleIds: user.roles.map((role) => role.id as RoleId),
		});
		if (res.type === "dismiss") return;
		updateRole({
			roleIds: res.newSelectedRoleIds,
		});
	}, [user.roles, updateRole]);

	return (
		<Table.Tr key={user.id}>
			<Table.Td>{user.displayName}</Table.Td>
			<Table.Td>{user.displayId && `@${user.displayId}`}</Table.Td>
			<Table.Td>
				{(user.realNameKana || user.realName) && (
					<div>
						<span
							className={css({
								display: "block",
								fontSize: "xs",
								color: "gray.500",
								whiteSpace: "nowrap",
							})}
						>
							{user.realNameKana}
						</span>
						<span
							className={css({
								display: "block",
								fontSize: "md",
								whiteSpace: "nowrap",
							})}
						>
							{user.realName}
						</span>
					</div>
				)}
			</Table.Td>
			<Table.Td>
				<div>
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.academicEmail}
					</code>
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.email}
					</code>
				</div>
			</Table.Td>
			<Table.Td>{user.studentId}</Table.Td>
			<Table.Td>{user.grade}</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
						alignItems: "center",
					})}
				>
					{user.roles.map((role) => (
						<RoleBadge key={role.id} role={role} />
					))}
					<IconButton type="button" label="ロールを編集" onClick={editRole}>
						<Edit size={16} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
