import { useCallback } from "react";
import { Edit } from "react-feather";
import { css } from "styled-system/css";
import { RoleBadge } from "~/components/feature/user/role-badge";
import { RoleSelector } from "~/components/feature/user/role-selector";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import { ROLE_IDS, type RoleId } from "~/types/role";
import type { User } from "~/types/user";
import { getFiscalYearStartDate } from "~/utils/date";
import { useAllUsers } from "../hooks/use-all-user";
import { useConfirmPayment } from "../hooks/use-confirm-payment";
import { useUpdateRole } from "../hooks/use-update-role";

export const MemberUsersTable = () => {
	const { data: users } = useAllUsers();
	const memberUsers = users.filter((user) =>
		user.roles.some((role) => role.id === ROLE_IDS.MEMBER),
	);

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
					<Table.Th>会費</Table.Th>
				</Table.Tr>
			</thead>
			<tbody>
				{memberUsers.map((user) => (
					<UserTableRow key={user.id} user={user} />
				))}
			</tbody>
		</Table.Root>
	);
};

export const NonMemberUsersTable = () => {
	const { data: users } = useAllUsers();
	const nonMemberUsers = users.filter((user) =>
		user.roles.every((role) => role.id !== ROLE_IDS.MEMBER),
	);

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
					<Table.Th>会費</Table.Th>
				</Table.Tr>
			</thead>
			<tbody>
				{nonMemberUsers.map((user) => (
					<UserTableRow key={user.id} user={user} />
				))}
			</tbody>
		</Table.Root>
	);
};

// ロールの数が多い場合、表示を制限する
const ROLE_SLICE_LIMIT = 3;

const UserTableRow = ({
	user,
}: {
	user: User;
}) => {
	const { mutate: updateRole } = useUpdateRole(user.id);
	const { mutate: confirmPayment } = useConfirmPayment(user.id);

	const editRole = useCallback(async () => {
		const res = await RoleSelector.call({
			selectedRoleIds: user.roles.map((role) => role.id as RoleId),
		});
		if (res.type === "dismiss") return;
		updateRole({
			roleIds: res.newSelectedRoleIds,
		});
	}, [user.roles, updateRole]);

	const handleConfirmPayment = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "会費の入金確認",
			children: (
				<div>
					<p
						className={css({
							textAlign: "center",
						})}
					>
						{user.displayName}さんの会費を入金確認しますか？
					</p>
					<p
						className={css({
							textAlign: "center",
							color: "rose.400",
							fontWeight: "bold",
							fontSize: "sm",
						})}
					>
						※この操作は取り消せません
					</p>
				</div>
			),
			danger: true,
		});
		if (res.type === "dismiss") return;
		confirmPayment();
	}, [confirmPayment, user.displayName]);

	const fiscalYearStartDate = getFiscalYearStartDate();

	// 会費の支払いが必要かどうか
	// 今年度のはじめ以降に納入確認があれば、支払いは不要
	const isRequiredPayment = user.lastPaymentConfirmedAt
		? user.lastPaymentConfirmedAt < fiscalYearStartDate
		: true;

	return (
		<Table.Tr key={user.id}>
			<Table.Td>
				{user.displayName && user.displayId && user.profileImageURL ? (
					<UserDisplay
						iconURL={user.profileImageURL}
						name={user.displayName}
						displayId={user.displayId}
						link
					/>
				) : (
					user.displayName
				)}
			</Table.Td>
			<Table.Td>
				{user.displayId && (
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						@{user.displayId}
					</code>
				)}
			</Table.Td>
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
			<Table.Td>
				{user.studentId && (
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.studentId}
					</code>
				)}
			</Table.Td>
			<Table.Td>
				{user.grade && (
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.grade}
					</code>
				)}
			</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
						alignItems: "center",
					})}
				>
					{user.roles.slice(0, ROLE_SLICE_LIMIT).map((role) => (
						<RoleBadge key={role.id} role={role} />
					))}
					{user.roles.length > ROLE_SLICE_LIMIT && (
						<span
							className={css({
								color: "gray.500",
								fontSize: "sm",
							})}
						>
							+{user.roles.length - ROLE_SLICE_LIMIT}
						</span>
					)}
					<IconButton type="button" label="ロールを編集" onClick={editRole}>
						<Edit size={16} />
					</IconButton>
				</div>
			</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 1,
						flexDirection: "column",
						alignItems: "flex-start",
					})}
				>
					{isRequiredPayment && (
						<button
							type="button"
							onClick={handleConfirmPayment}
							disabled={user.isProvisional}
						>
							<ButtonLike
								color="apply"
								size="sm"
								variant="secondary"
								disabled={user.isProvisional}
							>
								<span
									className={css({
										fontSize: "sm",
										whiteSpace: "nowrap",
									})}
								>
									入金確認
								</span>
							</ButtonLike>
						</button>
					)}
					{user.lastPaymentConfirmedAt && (
						<span
							className={css({
								color: "gray.500",
								fontSize: "sm",
								marginRight: 1,
							})}
						>
							{user.lastPaymentConfirmedAt.toLocaleDateString("ja-JP", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
							})}
						</span>
					)}
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
