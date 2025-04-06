import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Table } from "~/components/ui/table";
import type { User } from "~/types/user";
import { usePendingUsers } from "../hooks/use-all-user";

export const PendingUsersTable = () => {
	const { data: users } = usePendingUsers();

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
					<Table.Th>操作</Table.Th>
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
				{/* TODO: 今後承認を拒否するボタン・機能を追加 */}
				<div
					className={css({
						display: "flex",
						gap: 2,
						alignItems: "center",
					})}
				>
					<ButtonLike variant="primary">承認</ButtonLike>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
