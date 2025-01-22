import { Table } from "~/components/ui/table";
import { useAllApps } from "./internal/hooks/use-all-apps";

export default function List() {
	const apps = useAllApps();

	return (
		<div>
			これまでに作成された OAuth アプリケーション一覧
			<Table.Root>
				<thead>
					<Table.Tr>
						<Table.Th>アプリケーション名</Table.Th>
						<Table.Th>説明</Table.Th>
						<Table.Th>作成者</Table.Th>
						<Table.Th>管理者</Table.Th>
					</Table.Tr>
				</thead>
				<tbody>
					{(apps.data ?? []).map((app) => (
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
						</Table.Tr>
					))}
				</tbody>
			</Table.Root>
		</div>
	);
}
