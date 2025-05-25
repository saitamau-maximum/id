import { css } from "styled-system/css";
import { Panel } from "./internal/components/panel";
import { RoleCountsGraph } from "./internal/components/role-counts-graph";
import { TodayLoggedInUsers } from "./internal/components/today-loggedin-users";
import { UsersTransitionGraph } from "./internal/components/users-transition-graph";

export default function AdminHome() {
	return (
		<div
			className={css({
				display: "grid",
				gridTemplateColumns: "repeat(1, 1fr)",
				gap: 4,
				width: "100%",
				"@dashboard/4xl": {
					gridTemplateColumns: "repeat(2, 1fr)",
				},
			})}
		>
			<Panel
				title="IdPユーザー登録状況の推移"
				description="ユーザー登録状況の推移をグラフで表示します。Provisioningは仮登録中の入金確認待ち、Memberは会費を支払っている会員です。"
			>
				<UsersTransitionGraph />
			</Panel>
			<Panel
				title="IdPユーザーの役割分布"
				description="ユーザーの役割分布をグラフで表示します。最新のデータを基にしています。"
			>
				<RoleCountsGraph />
			</Panel>
			<Panel
				title="ユーザーログイン数"
				description="今日ログインしたユーザーの数を表示します。"
			>
				<TodayLoggedInUsers />
			</Panel>
		</div>
	);
}
