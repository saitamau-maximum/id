import { relations } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey(),
		providerUserId: text("provider_user_id").notNull(),
		provider: text("provider").notNull(),
		/* 初期登録日時。NULLの場合は未初期化 */
		initializedAt: integer("initialized_at", { mode: "timestamp" }),
	},
	(table) => ({
		providerUserUnique: uniqueIndex("provider_user_unique").on(
			table.providerUserId,
			table.provider,
		),
	}),
);

export const usersRelations = relations(users, ({ one }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
	}),
}));

export const userProfiles = sqliteTable(
	"user_profiles",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		displayName: text("display_name"),
		profileImageURL: text("profile_image_url"),
		email: text("email"),
		studentId: text("student_id"),
		grade: text("grade"),
	},
	(table) => ({
		gradeIdx: index("grade_idx").on(table.grade),
	}),
);
