import type { ExternalRole } from "@idp/schema/entity/external-role";
import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ExternalRoleUpsertParams,
	IExternalRoleRepository,
} from "../../../repository/external-role";

type ExternalRoleRow = typeof schema.externalRoles.$inferSelect;

const toEntity = (row: ExternalRoleRow): ExternalRole => ({
	id: row.id,
	providerId: row.providerId as OAuthProviderId,
	externalRoleId: row.externalRoleId,
	name: row.name,
	lastFetchedAt: row.lastFetchedAt,
});

export class CloudflareExternalRoleRepository
	implements IExternalRoleRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async listAll(): Promise<ExternalRole[]> {
		const rows = await this.client.query.externalRoles.findMany();
		return rows.map(toEntity);
	}

	async listByProvider(providerId: OAuthProviderId): Promise<ExternalRole[]> {
		const rows = await this.client.query.externalRoles.findMany({
			where: eq(schema.externalRoles.providerId, providerId),
		});
		return rows.map(toEntity);
	}

	async getById(id: number): Promise<ExternalRole | null> {
		const row = await this.client.query.externalRoles.findFirst({
			where: eq(schema.externalRoles.id, id),
		});
		return row ? toEntity(row) : null;
	}

	async replaceProviderRoles(
		providerId: OAuthProviderId,
		roles: Omit<ExternalRoleUpsertParams, "providerId">[],
		fetchedAt: Date,
	): Promise<ExternalRole[]> {
		if (roles.length === 0) {
			// 引数が空 → provider の全ロールを削除
			await this.client
				.delete(schema.externalRoles)
				.where(eq(schema.externalRoles.providerId, providerId));
			return [];
		}

		// upsert: 既存があれば name と lastFetchedAt を更新
		await this.client
			.insert(schema.externalRoles)
			.values(
				roles.map((r) => ({
					providerId,
					externalRoleId: r.externalRoleId,
					name: r.name,
					lastFetchedAt: fetchedAt,
				})),
			)
			.onConflictDoUpdate({
				target: [
					schema.externalRoles.providerId,
					schema.externalRoles.externalRoleId,
				],
				set: {
					name: sql`excluded.name`,
					lastFetchedAt: sql`excluded.last_fetched_at`,
				},
			});

		// 今回取得した一覧に含まれない既存行を削除
		await this.client.delete(schema.externalRoles).where(
			and(
				eq(schema.externalRoles.providerId, providerId),
				notInArray(
					schema.externalRoles.externalRoleId,
					roles.map((r) => r.externalRoleId),
				),
			),
		);

		const rows = await this.client.query.externalRoles.findMany({
			where: and(
				eq(schema.externalRoles.providerId, providerId),
				inArray(
					schema.externalRoles.externalRoleId,
					roles.map((r) => r.externalRoleId),
				),
			),
		});
		return rows.map(toEntity);
	}
}
