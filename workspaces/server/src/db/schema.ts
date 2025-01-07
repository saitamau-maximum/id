import { relations } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey(),
		providerUserId: text("provider_user_id").notNull(),
		provider: text("provider").notNull(),
	},
	(table) => ({
		providerUserUnique: uniqueIndex("provider_user_unique").on(
			table.providerUserId,
			table.provider,
		),
	}),
);

export const usersRelations = relations(users, ({ one }) => ({
	profile: one(usersProfile, {
		fields: [users.id],
		references: [usersProfile.userId],
	}),
}));

export const usersProfile = sqliteTable("usersprofile", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	displayName: text("display_name"),
	profileImageURL: text("profile_image_url"),
});
