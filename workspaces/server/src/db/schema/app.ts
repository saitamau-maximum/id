import { relations } from "drizzle-orm";
import {
	type AnySQLiteColumn,
	index,
	int,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
	oauthClientSecrets,
	oauthClients,
	oauthConnections,
	oauthTokens,
} from "./oauth";

// 認証以外のアプリケーション関連のスキーマ定義

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	/* 初期登録日時。NULLの場合は未初期化 */
	initializedAt: integer("initialized_at", { mode: "timestamp" }),
	/* 仮登録の場合は招待コードが初期化される。本登録が完了すると null となる。 */
	invitationId: text("invitation_id").references(
		(): AnySQLiteColumn => invites.id,
	),
	/* 最後に会費を"支払ったことを確認した"日時 (払った日時ではない)。 */
	lastPaymentConfirmedAt: integer("last_payment_confirmed_at", {
		mode: "timestamp",
	}),
	/* 最終ログイン日時 */
	lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
});

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
	}),
	invitation: one(invites, {
		fields: [users.invitationId],
		references: [invites.id],
	}),
	oauthOwningClients: many(oauthClients),
	oauthManagingClients: many(oauthClients),
	oauthIssuedSecrets: many(oauthClientSecrets),
	oauthIssuedTokens: many(oauthTokens),
	oauthConnections: many(oauthConnections),
	roles: many(userRoles),
	certifications: many(userCertifications),
	socialLinks: many(socialLinks),
	equipments: many(equipments),
}));

export const userProfiles = sqliteTable(
	"user_profiles",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		displayName: text("display_name"),
		realName: text("real_name"),
		realNameKana: text("real_name_kana"),
		displayId: text("display_id"),
		profileImageURL: text("profile_image_url"),
		academicEmail: text("academic_email"),
		email: text("email"),
		studentId: text("student_id"),
		grade: integer("grade"),
		faculty: integer("faculty"),
		department: integer("department"),
		laboratory: text("laboratory"),
		graduateSchool: text("graduate_school"),
		specialization: text("specialization"),
		bio: text("bio"),
		updatedAt: integer("updated_at", { mode: "timestamp" }),
	},
	(table) => [
		index("grade_idx").on(table.grade),
		uniqueIndex("display_id_unique").on(table.displayId),
	],
);

export const userProfilesRelations = relations(
	userProfiles,
	({ one, many }) => ({
		user: one(users, {
			fields: [userProfiles.userId],
			references: [users.id],
		}),
		oauthConnections: many(oauthConnections),
	}),
);

export const userRoles = sqliteTable(
	"user_roles",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id),
		roleId: int("role_id", { mode: "number" }).notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
	}),
}));

export const socialLinks = sqliteTable(
	"social_links",
	{
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		url: text("url").notNull().primaryKey(),
	},
	(table) => [index("social_links_user_idx").on(table.userId)],
);

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
	user: one(users, {
		fields: [socialLinks.userId],
		references: [users.id],
	}),
}));

export const calendarEvents = sqliteTable(
	"calendar_events",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description"),
		startAt: text("start_at").notNull(),
		endAt: text("end_at").notNull(),
		locationId: text("location_id").references(() => locations.id, {
			onDelete: "set null",
		}),
	},
	(table) => [
		index("user_idx").on(table.userId),
		index("start_at_idx").on(table.startAt),
		index("end_at_idx").on(table.endAt),
	],
);

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
	location: one(locations, {
		fields: [calendarEvents.locationId],
		references: [locations.id],
	}),
}));

export const locations = sqliteTable("locations", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const locationsRelations = relations(locations, ({ many }) => ({
	events: many(calendarEvents),
}));

export const certifications = sqliteTable("certifications", {
	id: text("id").primaryKey(),
	title: text("title").notNull().unique(),
	description: text("description").notNull().default(""),
});

export const userCertifications = sqliteTable(
	"user_certifications",
	{
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		certificationId: text("certification_id")
			.references(() => certifications.id)
			.notNull(),
		// 「タイムスタンプとしていつ資格を取得したか」は微妙なので、年のみ管理する
		certifiedIn: integer("certified_in").notNull(),
		isApproved: integer("is_approved", { mode: "boolean" })
			.notNull()
			.default(false),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.certificationId] }),
		index("user_certifiedat_idx").on(table.userId, table.certifiedIn),
	],
);

export const certificationRelations = relations(certifications, ({ many }) => ({
	userCertifications: many(userCertifications),
}));

export const userCertificationsRelations = relations(
	userCertifications,
	({ one }) => ({
		certification: one(certifications, {
			fields: [userCertifications.certificationId],
			references: [certifications.id],
		}),
		user: one(users, {
			fields: [userCertifications.userId],
			references: [users.id],
		}),
	}),
);

export const invites = sqliteTable("invites", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }),
	remainingUse: int("remaining_use"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	issuedByUserId: text("issued_by")
		.references(() => users.id)
		.notNull(),
});

export const invitesRelations = relations(invites, ({ one }) => ({
	issuedBy: one(users, {
		fields: [invites.issuedByUserId],
		references: [users.id],
	}),
}));

export const inviteRoles = sqliteTable(
	"invite_roles",
	{
		inviteId: text("invite_id")
			.references(() => invites.id)
			.notNull(),
		roleId: int("role_id", { mode: "number" }).notNull(),
	},
	(table) => [primaryKey({ columns: [table.inviteId, table.roleId] })],
);

export const equipments = sqliteTable("equipments", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ownerId: text("owner_id")
		.references(() => users.id)
		.notNull(),
});

export const equipmentsRelations = relations(equipments, ({ one }) => ({
	owner: one(users, {
		fields: [equipments.ownerId],
		references: [users.id],
	}),
}));

// 外部ロール付与条件
// 1 行 = 1 つの AND 条件 (requirements を全て満たすユーザーに external_role_id を付与する)。
// 同じ (provider_id, external_role_id) に対して複数行あれば、行間は OR で結合される。
// → 結果として OR-of-ANDs (積和標準形) で任意の論理式を表現できる。
export const externalRoleConditions = sqliteTable(
	"external_role_conditions",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		providerId: int("provider_id").notNull(),
		// GitHub Team の slug、Discord Role の snowflake などの provider 側 ID
		externalRoleId: text("external_role_id").notNull(),
		// requirements の件数。「ユーザーが必要 role を全部持つ」判定を SQL の
		//   GROUP BY ... HAVING COUNT(*) = requirement_count
		// で行うため、冗長カラムとして持っておく。
		requirementCount: int("requirement_count").notNull(),
		// requirements の正規化 (sort 済み role_id をカンマ区切り) を入れる。
		// 「同じ (provider, role, requirements) の条件を二重登録」を UNIQUE で防ぐ。
		requirementSignature: text("requirement_signature").notNull(),
	},
	(table) => [
		uniqueIndex("external_role_conditions_dedup").on(
			table.providerId,
			table.externalRoleId,
			table.requirementSignature,
		),
		index("external_role_conditions_provider_idx").on(table.providerId),
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

export const externalRoleConditionsRelations = relations(
	externalRoleConditions,
	({ many }) => ({
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
