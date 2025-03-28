import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { Table } from "~/components/ui/table";
import { useInvitations } from "../hooks/use-invitations";

export const InvitationsTable = () => {
	const { data: invitations } = useInvitations();

	if (invitations.length === 0) {
		return (
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
		);
	}

	return (
		<Table.Root>
			<thead>
				<Table.Tr>
					<Table.Th>期限</Table.Th>
					<Table.Th>残り使用回数</Table.Th>
					<Table.Th>作成日</Table.Th>
					<Table.Th>作成者</Table.Th>
				</Table.Tr>
			</thead>
			<tbody>
				{invitations.map((invitation) => (
					<Table.Tr key={invitation.id}>
						<Table.Td>{invitation.expiresAt?.toLocaleDateString()}</Table.Td>
						<Table.Td>{invitation.remainingUse}</Table.Td>
						<Table.Td>{invitation.createdAt.toLocaleDateString()}</Table.Td>
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
	);
};
