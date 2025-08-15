import { relations } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
