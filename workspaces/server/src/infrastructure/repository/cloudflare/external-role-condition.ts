import type { ExternalRoleGrantCondition } from "@idp/schema/entity/external-role";
import type { RoleId } from "@idp/schema/entity/role";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { IExternalRoleConditionRepository } from "../../../repository/external-role-condition";

type ConditionRow = typeof schema.externalRoleGrantConditions.$inferSelect;

const toEntity = (row: ConditionRow): ExternalRoleGrantCondition => ({
	externalRoleId: row.externalRoleId,
	requiredRoleId: row.requiredRoleId as RoleId,
});

export class CloudflareExternalRoleConditionRepository
	implements IExternalRoleConditionRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async listAll(): Promise<ExternalRoleGrantCondition[]> {
		const rows = await this.client.query.externalRoleGrantConditions.findMany();
		return rows.map(toEntity);
	}

	async listByExternalRoleId(
		externalRoleId: number,
	): Promise<ExternalRoleGrantCondition[]> {
		const rows = await this.client.query.externalRoleGrantConditions.findMany({
			where: eq(
				schema.externalRoleGrantConditions.externalRoleId,
				externalRoleId,
			),
		});
		return rows.map(toEntity);
	}

	async setForExternalRole(
		externalRoleId: number,
		requiredRoleIds: RoleId[],
	): Promise<void> {
		// 重複を排除した上で完全置き換え
		const unique = Array.from(new Set(requiredRoleIds));

		await this.client
			.delete(schema.externalRoleGrantConditions)
			.where(
				eq(schema.externalRoleGrantConditions.externalRoleId, externalRoleId),
			);

		if (unique.length === 0) return;

		await this.client.insert(schema.externalRoleGrantConditions).values(
			unique.map((requiredRoleId) => ({
				externalRoleId,
				requiredRoleId,
			})),
		);
	}
}
