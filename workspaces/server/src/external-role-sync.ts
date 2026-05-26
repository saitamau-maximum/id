import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { RoleId } from "@idp/schema/entity/role";
import type { ExternalRoleCondition } from "./repository/external-role-condition";
import type { IExternalRoleProviderRepository } from "./repository/external-role-provider";

export interface SyncConnection {
	providerId: OAuthProviderId;
	// GitHub は username (login)、Discord は snowflake
	externalUserId: string;
}

export interface SyncFailure {
	externalRoleId: string;
	action: "add" | "remove";
	error: unknown;
}

export interface ProviderSyncResult {
	providerId: OAuthProviderId;
	added: string[];
	removed: string[];
	failed: SyncFailure[];
}

/**
 * provider が sync 管理対象として扱う外部ロール (externalRoleId) の集合を返す。
 * sync 時、ユーザーが持つ外部ロールのうちこの集合に含まれるもののみが
 * 削除対象になる (手動運用ロールには触らない)。
 */
export const getManagedExternalRoleIds = (
	conditions: readonly ExternalRoleCondition[],
	providerId: OAuthProviderId,
): Set<string> => {
	return new Set(
		conditions
			.filter((c) => c.providerId === providerId)
			.map((c) => c.externalRoleId),
	);
};

/**
 * 指定された IdP ロールを持つユーザーが provider 側で持つべき外部ロール
 * (externalRoleId) の集合を計算する。
 *
 * 1 condition は AND セマンティクス (requiredRoleIds を全て持つ場合に成立)。
 * 同じ externalRoleId に対して複数 condition があれば、行間は OR で結合される
 * = 1 つでも成立する condition があればその externalRoleId を付与する。
 */
export const computeAssignedExternalRoles = (
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

/**
 * provider 側の現状 (current) と「持つべき」(shouldHave) を比較し、
 * 反映すべき差分 (adds / removes) を計算する純粋関数。
 *
 * - `adds`: shouldHave にあって current に無い ロール = 付与する
 * - `removes`: current にあって、かつ管理対象 (managed) で、shouldHave に
 *   無い ロール = 剥奪する
 *
 * managed に含まれない既存ロール (手動運用ロール、Bot 自身のロール等) は
 * 触らない。
 */
export const computeDiff = (
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

/**
 * 1 ユーザーについて、接続中の各 provider に対して外部ロールを同期する。
 *
 * - 失敗した add/remove は `failed` に記録するが、他の操作は継続する
 *   (1 ロール失敗で連鎖的に全部失敗するのを防ぐ)。冪等性があるため次回
 *   sync で再試行される。
 * - 管理対象 (config に書かれた externalRoleId) が空の provider はスキップする
 *   (sync 不要)。
 */
export const syncOneUser = async (params: {
	conditions: readonly ExternalRoleCondition[];
	userRoleIds: ReadonlySet<RoleId>;
	connections: readonly SyncConnection[];
	providerRepos: Partial<
		Record<OAuthProviderId, IExternalRoleProviderRepository>
	>;
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
		const current = await repo.fetchUserRoles(conn.externalUserId, managed);
		const { adds, removes } = computeDiff(shouldHave, current, managed);

		const failed: SyncFailure[] = [];

		const settledAdds = await Promise.allSettled(
			adds.map((role) => repo.assignRole(conn.externalUserId, role)),
		);
		settledAdds.forEach((res, i) => {
			if (res.status === "rejected") {
				failed.push({
					externalRoleId: adds[i],
					action: "add",
					error: res.reason,
				});
			}
		});

		const settledRemoves = await Promise.allSettled(
			removes.map((role) => repo.removeRole(conn.externalUserId, role)),
		);
		settledRemoves.forEach((res, i) => {
			if (res.status === "rejected") {
				failed.push({
					externalRoleId: removes[i],
					action: "remove",
					error: res.reason,
				});
			}
		});

		results.push({
			providerId: conn.providerId,
			added: adds,
			removed: removes,
			failed,
		});
	}

	return results;
};
