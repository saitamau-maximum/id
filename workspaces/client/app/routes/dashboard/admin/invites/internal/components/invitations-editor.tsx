import { type MouseEventHandler, useCallback } from "react";
import { Plus, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { InformationDialog } from "~/components/logic/callable/information";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { Invitation } from "~/types/invitation";
import { formatDateTime } from "~/utils/date";
import { useDeleteInvitation } from "../hooks/use-delete-invitation";
import { useGenerateInvitation } from "../hooks/use-generate-invitation";
import { useInvitations } from "../hooks/use-invitations";
import { GenerateInvitationURLDialog } from "./callable-generate-invitation-url-dialog";
import { InvitationURLDisplay } from "./invitation-url-display";

export const InvitationsEditor = () => {
	const { data: invitations } = useInvitations();
	const { mutate: generateInvitation } = useGenerateInvitation();

	const handleGenerateInvitation = useCallback(async () => {
		const res = await GenerateInvitationURLDialog.call();
		if (res.type === "dismiss") return;
		generateInvitation({
			title: res.payload.title,
			expiresAt: res.payload.expiresAt,
			remainingUse: res.payload.remainingUse,
		});
	}, [generateInvitation]);

	return (
		<div>
			<div
				className={css({
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 4,
				})}
			>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					招待
				</h2>
				<button type="button" onClick={handleGenerateInvitation}>
					<ButtonLike variant="primary" size="sm">
						<Plus size={16} />
						招待リンクを生成
					</ButtonLike>
				</button>
			</div>
			{invitations.length > 0 ? (
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th>タイトル</Table.Th>
							<Table.Th>残り使用回数</Table.Th>
							<Table.Th>期限</Table.Th>
							<Table.Th>作成日</Table.Th>
							<Table.Th>作成者</Table.Th>
							<Table.Th>操作</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{invitations.map((invitation) => (
							<InvitationTableRow key={invitation.id} invitation={invitation} />
						))}
					</tbody>
				</Table.Root>
			) : (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
						marginTop: 4,
						marginBottom: 4,
					})}
				>
					招待がありません
				</p>
			)}
		</div>
	);
};

const InvitationTableRow = ({ invitation }: { invitation: Invitation }) => {
	const { mutate: deleteInvitation } = useDeleteInvitation();

	const handleRowClick = useCallback(async (invitation: Invitation) => {
		await InformationDialog.call({
			title: "招待リンク",
			children: (
				<InvitationURLDisplay title={invitation.title} id={invitation.id} />
			),
		});
	}, []);

	const handleDeleteInvitation = useCallback<
		MouseEventHandler<HTMLButtonElement>
	>(
		async (e) => {
			e.stopPropagation();
			const res = await ConfirmDialog.call({
				title: "招待リンクの削除",
				children: <DeleteConfirmation title={invitation.title} />,
				danger: true,
			});
			if (res.type === "dismiss") return;
			deleteInvitation(invitation.id);
		},
		[invitation, deleteInvitation],
	);

	return (
		<Table.Tr key={invitation.id} onClick={() => handleRowClick(invitation)}>
			<Table.Td>{invitation.title}</Table.Td>
			<Table.Td>
				{invitation.remainingUse !== null && (
					<div
						className={css({
							display: "flex",
							gap: 2,
							alignItems: "center",
						})}
					>
						{invitation.remainingUse}
						{invitation.remainingUse <= 0 && (
							<span
								className={css({
									color: "rose.500",
									fontSize: "xs",
								})}
							>
								(使用済み)
							</span>
						)}
					</div>
				)}
			</Table.Td>
			<Table.Td>
				{invitation.expiresAt && (
					<div
						className={css({
							display: "flex",
							gap: 2,
							alignItems: "center",
						})}
					>
						{formatDateTime(invitation.expiresAt)}
						{invitation.expiresAt < new Date() && (
							<span
								className={css({
									color: "rose.500",
									fontSize: "xs",
								})}
							>
								(期限切れ)
							</span>
						)}
					</div>
				)}
			</Table.Td>
			<Table.Td>{formatDateTime(invitation.createdAt)}</Table.Td>
			<Table.Td>
				<UserDisplay
					iconURL={invitation.issuedBy.profileImageURL}
					name={invitation.issuedBy.displayName || ""}
					displayId={invitation.issuedBy.displayId || ""}
					link
				/>
			</Table.Td>
			<Table.Td
				className={css({ display: "flex", gap: 2, justifyContent: "center" })}
			>
				<IconButton
					label="削除"
					color="danger"
					onClick={handleDeleteInvitation}
				>
					<Trash size={16} />
				</IconButton>
			</Table.Td>
		</Table.Tr>
	);
};
