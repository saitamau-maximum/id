import { relations } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userProfiles, users } from "../app";

// 外部OAuthプロバイダを利用して IDP にログインするための、OAuth Clientとしてのスキーマ

// さすがに client_secret とかは環境変数側に持たせるべき(見れちゃうので)
// → たぶん各々の OAuth ページとかを作ることになりそう
// OAuth の接続情報に対する Reference Provider ID として使う
export const oauthProviders = sqliteTable("oauth_providers", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});

export const oauthConnections = sqliteTable(
	"oauth_connections",
	{
		userId: text("user_id").notNull(),
		providerId: int("provider_id", { mode: "number" })
			.notNull()
			.references(() => oauthProviders.id),
		providerUserId: text("provider_user_id").notNull(), // OAuth Provider 側の User ID
		// 以下取れそうな情報を書く
		email: text("email"),
		name: text("name"),
		profileImageUrl: text("profile_image_url"),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.providerId] }),
	}),
);

export const oauthProvidersRelations = relations(
	oauthProviders,
	({ many }) => ({
		connections: many(oauthConnections),
	}),
);

export const oauthConnectionsRelations = relations(
	oauthConnections,
	({ one }) => ({
		provider: one(oauthProviders, {
			fields: [oauthConnections.providerId],
			references: [oauthProviders.id],
		}),
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
