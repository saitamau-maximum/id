import { ROLE_BY_ID, ROLE_IDS } from "@idp/schema/entity/role";
import { useCallback } from "react";
import { Download } from "react-feather";
import type { MetaFunction } from "react-router";
import { css } from "styled-system/css";
import { RoleBadge } from "~/components/feature/user/role-badge";
import { ButtonLike } from "~/components/ui/button-like";
import {
	MemberUsersTable,
	NonMemberUsersTable,
} from "./internal/components/table";
import { useAllUsers } from "./internal/hooks/use-all-user";
import { exportMembersTsv } from "./internal/utils/export-tsv";

export const meta: MetaFunction = () => {
	return [{ title: "ユーザー管理 | Maximum IdP" }];
};

export default function AdminUsers() {
	const { data: users } = useAllUsers();

	const handleExportTsv = useCallback(() => {
		const memberUsers = users.filter((user) =>
			user.roles.some((role) => role.id === ROLE_IDS.MEMBER),
		);
		exportMembersTsv(memberUsers);
	}, [users]);

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
						marginBottom: 2,
					})}
				>
					ユーザー
				</h2>
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
						marginBottom: 4,
					})}
				>
					このテーブルには、現在のメンバーであるユーザーが含まれます。
					<br />
					また、年度移行期間中は今年の支払いをしていなくとも、来年度のメンバーシップを持つユーザーとして表示されます。
					<br />
					<span className={css({ marginRight: 1 })}>
						<RoleBadge role={ROLE_BY_ID[ROLE_IDS.MEMBER]} />
					</span>
					を削除することで、非会員にすることができます。
				</p>
				<div
					className={css({
						display: "flex",
						justifyContent: "flex-end",
						marginBottom: 2,
					})}
				>
					<button type="button" onClick={handleExportTsv}>
						<ButtonLike variant="secondary" size="sm">
							<Download size={14} />
							TSV エクスポート
						</ButtonLike>
					</button>
				</div>
				<MemberUsersTable />
			</div>
			<div>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
						marginBottom: 2,
					})}
				>
					非会員のユーザー
				</h2>
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
						marginBottom: 4,
					})}
				>
					このテーブルには、退会されたユーザーが含まれます。
					<br />
					入金確認をすると、
					<span className={css({ marginLeft: 1, marginRight: 1 })}>
						<RoleBadge role={ROLE_BY_ID[ROLE_IDS.MEMBER]} />
					</span>
					が付与され、自動的に会員に戻ります。
				</p>
				<NonMemberUsersTable />
			</div>
		</div>
	);
}
