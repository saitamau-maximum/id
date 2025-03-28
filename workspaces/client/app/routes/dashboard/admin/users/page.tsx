import { css } from "styled-system/css";
import { UsersTable } from "./internal/components/table";

export default function AdminUsers() {
	return (
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
	);
}
