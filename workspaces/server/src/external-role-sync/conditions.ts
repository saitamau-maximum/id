import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { RoleId } from "@idp/schema/entity/role";

/**
 * 外部ロール付与条件の static 定義。
 *
 * 1 行 = 「provider 側の外部ロール 1 つを、指定の IdP ロール (`requiredRoleIds`)
 * のいずれかを持つユーザーに付与する」というルール。
 *
 * - `externalRoleId`: GitHub Team の slug / Discord Role の snowflake
 * - `requiredRoleIds`: 1 つでも持っていれば付与 (OR セマンティクス)
 *
 * ここに書かれた外部ロールだけが sync の管理対象になる。
 * 書かれていない外部ロール (例: Discord Bot 自身のロール、手動運用の
 * ロール) は sync で触らない。
 *
 * 例:
 * ```ts
 * import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
 * import { ROLE_IDS } from "@idp/schema/entity/role";
 *
 * { providerId: OAUTH_PROVIDER_IDS.GITHUB, externalRoleId: "dev",
 *   requiredRoleIds: [ROLE_IDS.DEV] },
 * { providerId: OAUTH_PROVIDER_IDS.DISCORD, externalRoleId: "1234567890",
 *   requiredRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.PR] },
 * ```
 */
export interface ExternalRoleCondition {
	providerId: OAuthProviderId;
	externalRoleId: string;
	requiredRoleIds: readonly RoleId[];
}

export const EXTERNAL_ROLE_CONDITIONS: readonly ExternalRoleCondition[] = [
	// 運用開始までは空のまま
] as const;

// 起動時の不整合チェック: providerId 内で externalRoleId が重複している場合エラー。
// 重複を許すと「同じ外部ロールに対して条件が複数行ある」=「OR で結合」になるが、
// 1 行に requiredRoleIds をまとめて書けば同じことが表現できるので、運用ルール
// として重複行を禁止する。
{
	const seen = new Map<OAuthProviderId, Set<string>>();
	for (const cond of EXTERNAL_ROLE_CONDITIONS) {
		const set = seen.get(cond.providerId) ?? new Set<string>();
		if (set.has(cond.externalRoleId)) {
			throw new Error(
				`EXTERNAL_ROLE_CONDITIONS: 同じ providerId=${cond.providerId} と externalRoleId=${cond.externalRoleId} の組が重複しています。requiredRoleIds を 1 行にまとめてください。`,
			);
		}
		set.add(cond.externalRoleId);
		seen.set(cond.providerId, set);
	}
}

/**
 * provider が sync 管理対象として扱う外部ロール (externalRoleId) の集合を返す。
 * sync 時、ユーザーが持つ外部ロールのうちこの集合に含まれるもののみが
 * 削除対象になる (手動運用ロールには触らない)。
 */
export const getManagedExternalRoleIds = (
	providerId: OAuthProviderId,
): Set<string> => {
	return new Set(
		EXTERNAL_ROLE_CONDITIONS.filter((c) => c.providerId === providerId).map(
			(c) => c.externalRoleId,
		),
	);
};

/**
 * 指定された IdP ロールを持つユーザーが provider 側で持つべき外部ロール
 * (externalRoleId) の集合を計算する。
 *
 * 条件は OR セマンティクス: requiredRoleIds の **いずれか** を持っていれば
 * その外部ロールを付与する。
 */
export const computeAssignedExternalRoles = (
	providerId: OAuthProviderId,
	userRoleIds: ReadonlySet<RoleId>,
): Set<string> => {
	const assigned = new Set<string>();
	for (const cond of EXTERNAL_ROLE_CONDITIONS) {
		if (cond.providerId !== providerId) continue;
		if (cond.requiredRoleIds.some((r) => userRoleIds.has(r))) {
			assigned.add(cond.externalRoleId);
		}
	}
	return assigned;
};
