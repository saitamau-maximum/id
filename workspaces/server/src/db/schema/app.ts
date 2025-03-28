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
});

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
	}),
	oauthOwningClients: many(oauthClients),
	oauthManagingClients: many(oauthClients),
	oauthIssuedSecrets: many(oauthClientSecrets),
	oauthIssuedTokens: many(oauthTokens),
	oauthConnections: many(oauthConnections),
	roles: many(userRoles),
	certifications: many(userCertifications),
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
		grade: text("grade"),
		bio: text("bio"),
	},
	(table) => ({
		gradeIdx: index("grade_idx").on(table.grade),
		displayIdUnique: uniqueIndex("display_id_unique").on(table.displayId),
	}),
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
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.roleId] }),
	}),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
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
		description: text("description").notNull(),
		startAt: text("start_at").notNull(),
		endAt: text("end_at").notNull(),
		locationId: text("location_id").references(() => locations.id, {
			onDelete: "set null",
		}),
	},
	(table) => ({
		userIdx: index("user_idx").on(table.userId),
		startAtIdx: index("start_at_idx").on(table.startAt),
		endAtIdx: index("end_at_idx").on(table.endAt),
	}),
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
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.certificationId] }),
		userCertifiedAtIdx: index("user_certifiedat_idx").on(
			table.userId,
			table.certifiedIn,
		),
	}),
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
	(table) => ({
		pk: primaryKey({ columns: [table.inviteId, table.roleId] }),
	}),
);
