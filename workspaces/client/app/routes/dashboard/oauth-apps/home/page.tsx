import { useMemo } from "react";
import { Link } from "react-router";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { useAllApps } from "../internal/hooks/use-apps";

export default function Home() {
	const { user } = useAuth();
	const { data: oauthApps } = useAllApps();
	const filteredApps = useMemo(() => {
		return (oauthApps ?? []).filter((app) =>
			app.managers.some((manager) => manager.id === user?.id),
		);
	}, [oauthApps, user]);

	return (
		<div>
			<p>あなたが管理している OAuth アプリケーション一覧</p>
			<Table.Root>
				<thead>
					<Table.Tr>
						<Table.Th>アプリケーション名</Table.Th>
						<Table.Th>説明</Table.Th>
						<Table.Th>作成者</Table.Th>
						<Table.Th>管理者</Table.Th>
						<Table.Th>編集</Table.Th>
					</Table.Tr>
				</thead>
				<tbody>
					{filteredApps.map((app) => (
						<Table.Tr key={app.id}>
							<Table.Td>
								{app.logoUrl && <img src={app.logoUrl} alt={app.name} />}
								{app.name}
							</Table.Td>
							<Table.Td>{app.description}</Table.Td>
							<Table.Td>
								{app.owner.profileImageURL && (
									<img
										src={app.owner.profileImageURL}
										alt={app.owner.displayName}
										width={20}
										height={20}
									/>
								)}
								{app.owner.displayName ?? "owner が初期設定未済はなんか変だよ"}
							</Table.Td>
							<Table.Td>
								{app.managers.map((manager) => (
									<span key={manager.id}>
										{manager.profileImageURL && (
											<img
												src={manager.profileImageURL}
												alt={manager.displayName}
												width={20}
												height={20}
											/>
										)}
										{manager.displayName}
									</span>
								))}
							</Table.Td>
							<Table.Td>
								<Link to={`/oauth-apps/${app.id}`}>
									<AnchorLike>編集</AnchorLike>
								</Link>
							</Table.Td>
						</Table.Tr>
					))}
				</tbody>
			</Table.Root>
		</div>
	);
}
