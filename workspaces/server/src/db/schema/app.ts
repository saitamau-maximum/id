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
