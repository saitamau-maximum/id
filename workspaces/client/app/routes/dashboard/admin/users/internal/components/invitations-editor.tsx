import { useCallback } from "react";
import { Plus } from "react-feather";
import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ButtonLike } from "~/components/ui/button-like";
import { Table } from "~/components/ui/table";
import { useGenerateInvitation } from "../hooks/use-generate-invitation-code";
import { useInvitations } from "../hooks/use-invitations";
import { GenerateInvitationURLDialog } from "./callable-generate-invitation-url-dialog";

const formatLocalDate = (date: Date | null) => {
	if (!date) return "";
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	};
	return date.toLocaleDateString("ja-JP", options);
};

export const InvitationsEditor = () => {
	const { data: invitations } = useInvitations();
	const { mutate: generateInvitation } = useGenerateInvitation();

	const handleGenerateInvitation = useCallback(async () => {
		const res = await GenerateInvitationURLDialog.call();
		if (res.type === "dismiss") return;
		generateInvitation({
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
						招待コードを生成
					</ButtonLike>
				</button>
			</div>
			{invitations.length > 0 ? (
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th>残り使用回数</Table.Th>
							<Table.Th>期限</Table.Th>
							<Table.Th>作成日</Table.Th>
							<Table.Th>作成者</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{invitations.map((invitation) => (
							<Table.Tr key={invitation.id}>
								<Table.Td>
									{invitation.remainingUse && (
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
											{formatLocalDate(invitation.expiresAt)}
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
								<Table.Td>{formatLocalDate(invitation.createdAt)}</Table.Td>
								<Table.Td>
									<UserDisplay
										iconURL={invitation.issuedBy.profileImageURL}
										name={invitation.issuedBy.displayName || ""}
										displayId={invitation.issuedBy.displayId || ""}
										link
									/>
								</Table.Td>
							</Table.Tr>
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
