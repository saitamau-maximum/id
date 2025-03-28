import { css } from "styled-system/css";
import { GenerateInvitationURLDialog } from "./internal/components/callable-generate-invitation-url-dialog";
import { InvitationsEditor } from "./internal/components/invitations-editor";
import { UsersTable } from "./internal/components/table";

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
					ユーザー
				</h2>
				<UsersTable />
			</div>
			<GenerateInvitationURLDialog.Root />
		</div>
	);
}
