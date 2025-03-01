import { useMemo } from "react";
import { Plus } from "react-feather";
import { Link, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ButtonLike } from "~/components/ui/button-like";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { NotFoundMessage } from "../internal/components/not-found-message";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";
import { useAllApps } from "../internal/hooks/use-apps";

export default function Home() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: oauthApps = [] } = useAllApps();
	const filteredApps = useMemo(() => {
		return oauthApps.filter((app) =>
			app.managers.some((manager) => manager.id === user?.id),
		);
	}, [oauthApps, user]);

	return (
		<div>
			<OAuthSectionHeader
				title="OAuth アプリケーション一覧"
				breadcrumb={[{ label: "アプリケーション一覧" }]}
			>
				<Link to="/oauth-apps/register">
					<ButtonLike>
						<Plus />
						新規作成
					</ButtonLike>
				</Link>
			</OAuthSectionHeader>
			{filteredApps.length === 0 && (
				<NotFoundMessage>
					管理しているアプリケーションはありません
				</NotFoundMessage>
			)}
			{filteredApps.length > 0 && (
				<Table.Root>
					<thead style={{ width: "100%" }}>
						<Table.Tr>
							<Table.Th>アイコン</Table.Th>
							<Table.Th>アプリ名</Table.Th>
							<Table.Th>説明</Table.Th>
							<Table.Th>作成者</Table.Th>
							<Table.Th>管理者</Table.Th>
						</Table.Tr>
					</thead>
					<tbody style={{ width: "100%" }}>
						{filteredApps.map((app) => (
							<Table.Tr
								key={app.id}
								onClick={() => navigate(`/oauth-apps/${app.id}`)}
							>
								<Table.Td>
									{app.logoUrl && (
										<img
											src={app.logoUrl}
											alt={app.name}
											width={64}
											height={64}
											className={css({
												borderRadius: "full",
												width: "64px",
												height: "64px",
												objectFit: "cover",
											})}
										/>
									)}
								</Table.Td>
								<Table.Td>
									<p className={css({ fontWeight: "bold" })}>{app.name}</p>
								</Table.Td>
								<Table.Td>
									<p
										className={css({
											display: "-webkit-box",
											lineClamp: 3,
											boxOrient: "vertical",
											overflow: "hidden",
										})}
									>
										{app.description}
									</p>
								</Table.Td>
								<Table.Td>
									<UserDisplay
										displayId={app.owner.displayId ?? ""}
										name={app.owner.displayName ?? ""}
										iconURL={app.owner.profileImageURL ?? ""}
									/>
								</Table.Td>
								<Table.Td>
									<div
										className={css({
											display: "flex",
											gap: "token(spacing.1) token(spacing.4)",
											flexWrap: "wrap",
										})}
									>
										{app.managers.map((manager) => (
											<UserDisplay
												key={manager.id}
												displayId={manager.displayId ?? ""}
												name={manager.displayName ?? ""}
												iconURL={manager.profileImageURL ?? ""}
											/>
										))}
									</div>
								</Table.Td>
							</Table.Tr>
						))}
					</tbody>
				</Table.Root>
			)}
		</div>
	);
}
