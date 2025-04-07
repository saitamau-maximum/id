import type {} from "node_modules/react-router/dist/development/route-data-aSUFWnQ6.mjs";
import { useCallback } from "react";
import { Check, X } from "react-feather";
import { css } from "styled-system/css";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { User } from "~/types/user";
import { useApproveInvitation } from "../hooks/use-approve-invitation";
import { useProvisionalUsers } from "../hooks/use-provisional-users";
import { useRejectInvitation } from "../hooks/use-reject-invitation";
import { ApproveConfirmation } from "./approve-confirmation";
import { RejectConfirmation } from "./reject-confirmation";

export const ProvisionalUsersTable = () => {
	const { data: users } = useProvisionalUsers();
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
					<Table.Th>招待元</Table.Th>
					<Table.Th>承認 / 却下</Table.Th>
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
	user: User & {
		invitationTitle?: string;
		invitationId?: string;
	};
}) => {
	const { mutate: approveInvitation } = useApproveInvitation();
	const { mutate: rejectInvitation } = useRejectInvitation();

	const handleSubmit = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "招待を承認",
			children: <ApproveConfirmation title={user.displayName} />,
		});
		if (res.type === "dismiss") return;
		approveInvitation(user.id);
	}, [user, approveInvitation]);

	const handleReject = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "招待を却下",
			children: <RejectConfirmation title={user.displayName} />,
			danger: true,
		});
		if (res.type === "dismiss") return;
		rejectInvitation(user.id);
	}, [user, rejectInvitation]);

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
				<div>
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.invitationTitle}
					</code>
					<code
						className={css({
							display: "block",
							fontSize: "sm",
							whiteSpace: "nowrap",
						})}
					>
						{user.invitationId}
					</code>
				</div>
			</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 2,
						alignItems: "center",
						justifyContent: "center",
						userSelect: "none",
					})}
				>
					<IconButton
						type="button"
						label="承認"
						onClick={handleSubmit}
						color="apply"
					>
						<Check size={20} />
					</IconButton>
					/
					<IconButton
						type="button"
						label="却下"
						onClick={handleReject}
						color="danger"
					>
						<X size={20} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
