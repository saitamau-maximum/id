import type { OAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { Context } from "hono";
import { type SyncConnection, syncOneUser } from "../external-role-sync/sync";
import type { HonoEnv } from "../factory";

/**
 * OAuthConnection から sync 用の externalUserId を抽出する。
 * - GitHub: provider 側の team membership API は username (login) を要求する
 *   ので `name` を使う (login 時に oauth_connections.name に保存している)。
 * - Discord: snowflake (= providerUserId) をそのまま使う。
 *
 * name が null など必要な情報が欠けている場合は null を返す (caller がスキップ)。
 */
const externalUserIdForConnection = (conn: OAuthConnection): string | null => {
	if (conn.providerId === OAUTH_PROVIDER_IDS.GITHUB) return conn.name;
	if (conn.providerId === OAUTH_PROVIDER_IDS.DISCORD)
		return conn.providerUserId;
	return null;
};

/**
 * 毎日 04:00 JST に実行される。
 * 本登録済み全ユーザーについて、IdP の roles を真値として GitHub Org Team /
 * Discord Guild Role に同期する。
 */
export const syncExternalRolesTask = async (c: Context<HonoEnv>) => {
	const {
		UserRepository,
		OAuthInternalRepository,
		ExternalRoleConditionRepository,
		ExternalRoleProviderRepositories,
	} = c.var;

	// 全 condition は cron 開始時に一括取得し、各ユーザーで使い回す
	// (ユーザー数 × DB 往復にしないため)
	const conditions = await ExternalRoleConditionRepository.listAll();
	if (conditions.length === 0) {
		console.log("syncExternalRolesTask: no conditions defined, skipping.");
		return;
	}

	const users = await UserRepository.fetchApprovedUsers();

	let userErrors = 0;
	let totalAdds = 0;
	let totalRemoves = 0;
	let totalFailures = 0;

	for (const user of users) {
		try {
			const userRoleIds = new Set(
				await UserRepository.fetchRolesByUserId(user.id),
			);
			const connections =
				await OAuthInternalRepository.fetchOAuthConnectionsByUserId(user.id);

			const syncConnections: SyncConnection[] = connections.flatMap((conn) => {
				const externalUserId = externalUserIdForConnection(conn);
				if (!externalUserId) return [];
				return [{ providerId: conn.providerId, externalUserId }];
			});

			const results = await syncOneUser({
				conditions,
				userRoleIds,
				connections: syncConnections,
				providerRepos: ExternalRoleProviderRepositories,
			});

			for (const r of results) {
				totalAdds += r.added.length;
				totalRemoves += r.removed.length;
				totalFailures += r.failed.length;
				for (const f of r.failed) {
					console.error(
						`syncExternalRolesTask: provider=${r.providerId} user=${user.id} action=${f.action} role=${f.externalRoleId}`,
						f.error,
					);
				}
			}
		} catch (e) {
			userErrors += 1;
			console.error(`syncExternalRolesTask: user=${user.id} unexpected`, e);
		}
	}

	console.log(
		`syncExternalRolesTask: users=${users.length} userErrors=${userErrors} adds=${totalAdds} removes=${totalRemoves} failures=${totalFailures}`,
	);
};
