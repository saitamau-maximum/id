import { css } from "styled-system/css";
import { InvitationsTable } from "./internal/components/invitations-table";
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
			<div>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
						marginBottom: 4,
					})}
				>
					招待
				</h2>
				<InvitationsTable />
			</div>
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
		</div>
	);
}
