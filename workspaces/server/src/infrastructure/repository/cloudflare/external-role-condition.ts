import { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { RoleId } from "@idp/schema/entity/role";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as v from "valibot";
import * as schema from "../../../db/schema";
import type {
	ExternalRoleCondition,
	IExternalRoleConditionRepository,
} from "../../../repository/external-role-condition";

export class CloudflareExternalRoleConditionRepository
	implements IExternalRoleConditionRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async listAll(): Promise<ExternalRoleCondition[]> {
		const rows = await this.client.query.externalRoleConditions.findMany({
			with: {
				requirements: true,
			},
		});

		return rows.flatMap((row) => {
			if (!v.is(OAuthProviderId, row.providerId)) return [];

			const requiredRoleIds = row.requirements.map((r) => r.requiredRoleId);
			// requirement が 1 件でも不正なら condition ごと除外する。
			// 不正な requirement を間引くと requiredRoleIds が減り、
			// 条件が意図より緩くなって誤ったユーザーに外部ロールが付与されるため。
			if (!requiredRoleIds.every((id) => v.is(RoleId, id))) return [];

			return [
				{
					id: row.id,
					providerId: row.providerId as OAuthProviderId,
					externalRoleId: row.externalRoleId,
					requiredRoleIds: new Set(requiredRoleIds as RoleId[]),
				},
			];
		});
	}
}
