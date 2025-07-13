import type { MetaFunction } from "react-router";
import { css } from "styled-system/css";
import { GenerateInvitationURLDialog } from "./internal/components/callable-generate-invitation-url-dialog";
import { InvitationsEditor } from "./internal/components/invitations-editor";
import { ProvisionalUsersTable } from "./internal/components/table";

export const meta: MetaFunction = () => {
	return [{ title: "招待管理 | Maximum IdP" }];
};

export default function AdminInvites() {
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
				<ProvisionalUsersTable />
			</div>
			<GenerateInvitationURLDialog.Root />
		</div>
	);
}
