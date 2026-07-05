import type { OAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import {
	OAUTH_PROVIDER_IDS,
	type OAuthProviderId,
} from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { RoleId } from "@idp/schema/entity/role";
import type { Context } from "hono";
import type { HonoEnv } from "../factory";
import type { ExternalRoleCondition } from "../repository/external-role-condition";

interface RoleActionFailure {
	roleId: string;
	error: unknown;
}

interface RoleProvider {
	fetchUserRoles(externalUserId: string): Promise<Set<string>>;
	assignRoles(
		externalUserId: string,
		roleIds: string[],
	): Promise<RoleActionFailure[]>;
	removeRoles(
		externalUserId: string,
		roleIds: string[],
	): Promise<RoleActionFailure[]>;
}

interface SyncConnection {
	providerId: OAuthProviderId;
	// GitHub は username (login)、Discord は snowflake
	externalUserId: string;
}

interface SyncFailure {
	externalRoleId: string;
	action: "add" | "remove";
	error: unknown;
}

interface ProviderSyncResult {
	providerId: OAuthProviderId;
	added: string[];
	removed: string[];
	failed: SyncFailure[];
}

const getManagedExternalRoleIds = (
	conditions: readonly ExternalRoleCondition[],
	providerId: OAuthProviderId,
): Set<string> => {
	return new Set(
		conditions
			.filter((c) => c.providerId === providerId)
			.map((c) => c.externalRoleId),
	);
};

const computeAssignedExternalRoles = (
	conditions: readonly ExternalRoleCondition[],
	providerId: OAuthProviderId,
	userRoleIds: ReadonlySet<RoleId>,
): Set<string> => {
	const assigned = new Set<string>();
	for (const cond of conditions) {
		if (cond.providerId !== providerId) continue;
		let satisfied = true;
		for (const req of cond.requiredRoleIds) {
			if (!userRoleIds.has(req)) {
				satisfied = false;
				break;
			}
		}
		if (satisfied) assigned.add(cond.externalRoleId);
	}
	return assigned;
};

const computeDiff = (
	shouldHave: ReadonlySet<string>,
	current: ReadonlySet<string>,
	managed: ReadonlySet<string>,
): { adds: string[]; removes: string[] } => {
	const adds: string[] = [];
	for (const role of shouldHave) {
		if (!current.has(role)) adds.push(role);
	}
	const removes: string[] = [];
	for (const role of current) {
		if (managed.has(role) && !shouldHave.has(role)) removes.push(role);
	}
	return { adds, removes };
};

const syncOneUser = async (params: {
	conditions: readonly ExternalRoleCondition[];
	userRoleIds: ReadonlySet<RoleId>;
	connections: readonly SyncConnection[];
	providerRepos: Partial<Record<OAuthProviderId, RoleProvider>>;
}): Promise<ProviderSyncResult[]> => {
	const results: ProviderSyncResult[] = [];

	for (const conn of params.connections) {
		const repo = params.providerRepos[conn.providerId];
		if (!repo) continue;

		const managed = getManagedExternalRoleIds(
			params.conditions,
			conn.providerId,
		);
		if (managed.size === 0) continue;

		const shouldHave = computeAssignedExternalRoles(
			params.conditions,
			conn.providerId,
			params.userRoleIds,
		);
		const current = await repo.fetchUserRoles(conn.externalUserId);
		const { adds, removes } = computeDiff(shouldHave, current, managed);

		const failed: SyncFailure[] = [];

		const addFailures = await repo.assignRoles(conn.externalUserId, adds);
		for (const f of addFailures) {
			failed.push({ externalRoleId: f.roleId, action: "add", error: f.error });
		}

		const removeFailures = await repo.removeRoles(conn.externalUserId, removes);
		for (const f of removeFailures) {
			failed.push({
				externalRoleId: f.roleId,
				action: "remove",
				error: f.error,
			});
		}

		results.push({
			providerId: conn.providerId,
			added: adds,
			removed: removes,
			failed,
		});
	}

	return results;
};

/*
 * OAuthConnection から sync 用の externalUserId を抽出する。
 * - GitHub: provider 側の team membership API は username (login) を要求するので `name` を使う
 * - Discord: snowflake (= providerUserId) をそのまま使う。
 * name が null など必要な情報が欠けている場合は null を返す (caller がスキップ)。
 */
const externalUserIdForConnection = (conn: OAuthConnection): string | null => {
	if (conn.providerId === OAUTH_PROVIDER_IDS.GITHUB) return conn.name;
	if (conn.providerId === OAUTH_PROVIDER_IDS.DISCORD)
		return conn.providerUserId;
	return null;
};

/**
 * 本登録済み全ユーザーについて、IdP の roles を真値として GitHub Org Team /
 * Discord Guild Role に同期する。
 */
export const syncExternalRolesTask = async (c: Context<HonoEnv>) => {
	const {
		UserRepository,
		OAuthInternalRepository,
		ExternalRoleConditionRepository,
		OrganizationRepository,
		DiscordBotRepository,
	} = c.var;

	const providerRepos = {
		[OAUTH_PROVIDER_IDS.GITHUB]: OrganizationRepository,
		[OAUTH_PROVIDER_IDS.DISCORD]: DiscordBotRepository,
	};

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

			const syncConnections: SyncConnection[] = connections
				.map((conn) => {
					const externalUserId = externalUserIdForConnection(conn);
					if (!externalUserId) return null;
					return { providerId: conn.providerId, externalUserId };
				})
				.filter((obj) => obj !== null);

			const results = await syncOneUser({
				conditions,
				userRoleIds,
				connections: syncConnections,
				providerRepos,
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
