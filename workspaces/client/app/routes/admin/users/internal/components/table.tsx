import { css } from "styled-system/css";
import { Table } from "~/components/ui/table";
import type { User } from "~/repository/auth";

import { RoleEditor } from "./role-editor";

interface Props {
	users: User[];
}

export const UsersTable = ({ users }: Props) => {
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
					<Table.Th>Role</Table.Th>
				</Table.Tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<Table.Tr key={user.id}>
						<Table.Td>{user.displayName}</Table.Td>
						<Table.Td>@{user.displayId}</Table.Td>
						<Table.Td>
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
							<RoleEditor userId={user.id} roles={user.roles} />
						</Table.Td>
					</Table.Tr>
				))}
			</tbody>
		</Table.Root>
	);
};
