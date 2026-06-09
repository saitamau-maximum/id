import { relations } from "drizzle-orm";
import {
	index,
	int,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { userProfiles, users } from "../app";

// 外部OAuthプロバイダを利用して IdP にログインするための、OAuth Clientとしてのスキーマ

export const oauthConnections = sqliteTable(
	"oauth_connections",
	{
		userId: text("user_id").notNull(),
		providerId: int("provider_id", { mode: "number" }).notNull(),
		providerUserId: text("provider_user_id").notNull(), // OAuth Provider 側の User ID
		// 以下取れそうな情報を書く
		refreshToken: text("refresh_token"),
		refreshTokenExpiresAt: int("refresh_token_expires_at", {
			mode: "timestamp",
		}),
		email: text("email"),
		name: text("name"),
		profileImageUrl: text("profile_image_url"),
	},
	(table) => [primaryKey({ columns: [table.userId, table.providerId] })],
);

export const oauthConnectionsRelations = relations(
	oauthConnections,
	({ one }) => ({
		user: one(users, {
			fields: [oauthConnections.userId],
			references: [users.id],
		}),
		profile: one(userProfiles, {
			fields: [oauthConnections.userId],
			references: [userProfiles.userId],
		}),
	}),
);

// IdP が管理する外部ロール (GitHub Team slug、Discord Role snowflake など)
export const externalRoles = sqliteTable(
	"external_roles",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		providerId: int("provider_id").notNull(),
		// GitHub Team の slug、Discord Role の snowflake などの provider 側 ID
		roleId: text("role_id").notNull(),
		name: text("name").notNull(),
	},
	(table) => [
		uniqueIndex("external_roles_provider_role_unique").on(
			table.providerId,
			table.roleId,
		),
	],
);

// 外部ロール付与条件
// 1 行 = 1 つの AND 条件 (requirements を全て満たすユーザーに external_role_id を付与する)。
// 同じ external_role_id に対して複数行あれば、行間は OR で結合される。
// → 結果として OR-of-ANDs (積和標準形) で任意の論理式を表現できる。
export const externalRoleConditions = sqliteTable(
	"external_role_conditions",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		externalRoleId: integer("external_role_id")
			.notNull()
			.references(() => externalRoles.id, { onDelete: "cascade" }),
		requirementCount: int("requirement_count").notNull(),
		// requirements の正規化 (sort 済み role_id をカンマ区切り) を入れる。
		// 「同じ (external_role, requirements) の条件を二重登録」を UNIQUE で防ぐ。
		requirementSignature: text("requirement_signature").notNull(),
	},
	(table) => [
		uniqueIndex("external_role_conditions_dedup").on(
			table.externalRoleId,
			table.requirementSignature,
		),
		index("external_role_conditions_role_idx").on(table.externalRoleId),
	],
);

export const externalRoleConditionRequirements = sqliteTable(
	"external_role_condition_requirements",
	{
		conditionId: integer("condition_id")
			.notNull()
			.references(() => externalRoleConditions.id, { onDelete: "cascade" }),
		requiredRoleId: int("required_role_id").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.conditionId, table.requiredRoleId] }),
	],
);

export const externalRolesRelations = relations(externalRoles, ({ many }) => ({
	conditions: many(externalRoleConditions),
}));

export const externalRoleConditionsRelations = relations(
	externalRoleConditions,
	({ one, many }) => ({
		externalRole: one(externalRoles, {
			fields: [externalRoleConditions.externalRoleId],
			references: [externalRoles.id],
		}),
		requirements: many(externalRoleConditionRequirements),
	}),
);

export const externalRoleConditionRequirementsRelations = relations(
	externalRoleConditionRequirements,
	({ one }) => ({
		condition: one(externalRoleConditions, {
			fields: [externalRoleConditionRequirements.conditionId],
			references: [externalRoleConditions.id],
		}),
	}),
);
