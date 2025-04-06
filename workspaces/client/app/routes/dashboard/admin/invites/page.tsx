import { css } from "styled-system/css";
import { GenerateInvitationURLDialog } from "./internal/components/callable-generate-invitation-url-dialog";
import { InvitationsEditor } from "./internal/components/invitations-editor";
import { PendingUsersTable } from "./internal/components/table";

export default function AdminUsers() {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 8,
			})}
		>
			<InvitationsEditor />
			<div>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
						marginBottom: 4,
					})}
				>
					承認待ちユーザー
				</h2>
				<PendingUsersTable />
			</div>
			<GenerateInvitationURLDialog.Root />
		</div>
	);
}
