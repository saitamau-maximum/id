import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { RoleId } from "@idp/schema/entity/role";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
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

		return rows.map((row) => ({
			id: row.id,
			providerId: row.providerId as OAuthProviderId,
			externalRoleId: row.externalRoleId,
			requiredRoleIds: new Set(
				row.requirements.map((r) => r.requiredRoleId as RoleId),
			),
		}));
	}
}
