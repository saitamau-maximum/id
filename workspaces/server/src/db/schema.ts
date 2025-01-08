import { relations } from "drizzle-orm";
import {
	int,
	primaryKey,
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
	},
	(table) => ({
		providerUserUnique: uniqueIndex("provider_user_unique").on(
			table.providerUserId,
			table.provider,
		),
	}),
);

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(usersProfile, {
		fields: [users.id],
		references: [usersProfile.userId],
	}),
	oauthIssuedSecrets: many(oauthClientSecret),
	oauthIssuedTokens: many(oauthToken),
	oauthConnections: many(oauthConnection),
}));

export const usersProfile = sqliteTable("usersprofile", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	displayName: text("display_name"),
	profileImageURL: text("profile_image_url"),
});

// ---------- OAuth 関連 ---------- //

export const oauthClient = sqliteTable("oauth_client", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	logoUrl: text("logo_url"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => users.id),
});

export const oauthClientSecret = sqliteTable(
	"oauth_client_secret",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.id),
		secret: text("secret").notNull(),
		description: text("description"),
		issuedBy: text("issued_by")
			.notNull()
			.references(() => users.id),
		issuedAt: int("issued_at", { mode: "timestamp_ms" }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.secret] }),
	}),
);

export const oauthClientCallback = sqliteTable(
	"oauth_client_callback",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.id),
		callbackUrl: text("callback_url").notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.callbackUrl] }),
	}),
);

export const oauthScope = sqliteTable("oauth_scope", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	description: text("description"),
});

export const oauthClientScope = sqliteTable(
	"oauth_client_scope",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.id),
		scopeId: int("scope_id", { mode: "number" })
			.notNull()
			.references(() => oauthScope.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.scopeId] }),
	}),
);

export const oauthToken = sqliteTable("oauth_token", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	clientId: text("client_id")
		.notNull()
		.references(() => oauthClient.id),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	code: text("code").notNull().unique(),
	codeExpiresAt: int("code_expires_at", { mode: "timestamp_ms" }).notNull(),
	codeUsed: int("code_used", { mode: "boolean" }).notNull(),
	redirectUri: text("redirect_uri"),
	accessToken: text("access_token").notNull().unique(),
	accessTokenExpiresAt: int("access_token_expires_at", {
		mode: "timestamp_ms",
	}).notNull(),
});

export const oauthTokenScope = sqliteTable(
	"oauth_token_scope",
	{
		tokenId: int("token_id", { mode: "number" })
			.notNull()
			.references(() => oauthToken.id),
		scopeId: int("scope_id", { mode: "number" })
			.notNull()
			.references(() => oauthScope.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.tokenId, table.scopeId] }),
	}),
);

// さすがに client_secret とかは環境変数側に持たせるべき(見れちゃうので)
// → たぶん各々の OAuth ページとかを作ることになりそう
// OAuth の接続情報に対する Reference Provider ID として使う
export const oauthProvider = sqliteTable("oauth_provider", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});

export const oauthConnection = sqliteTable(
	"oauth_connection",
	{
		userId: text("user_id").notNull(),
		providerId: int("provider_id", { mode: "number" })
			.notNull()
			.references(() => oauthProvider.id),
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

// ---------- OAuth Relations ---------- //

export const oauthClientRelations = relations(oauthClient, ({ one, many }) => ({
	owner: one(users, {
		fields: [oauthClient.ownerId],
		references: [users.id],
	}),
	secrets: many(oauthClientSecret),
	callbacks: many(oauthClientCallback),
	scopes: many(oauthClientScope),
}));

export const oauthClientSecretRelations = relations(
	oauthClientSecret,
	({ one }) => ({
		client: one(oauthClient, {
			fields: [oauthClientSecret.clientId],
			references: [oauthClient.id],
		}),
		issuer: one(users, {
			fields: [oauthClientSecret.issuedBy],
			references: [users.id],
		}),
	}),
);

export const oauthClientCallbackRelations = relations(
	oauthClientCallback,
	({ one }) => ({
		client: one(oauthClient, {
			fields: [oauthClientCallback.clientId],
			references: [oauthClient.id],
		}),
	}),
);

export const oauthScopeRelations = relations(oauthScope, ({ many }) => ({
	clients: many(oauthClientScope),
	tokens: many(oauthTokenScope),
}));

export const oauthClientScopeRelations = relations(
	oauthClientScope,
	({ one }) => ({
		client: one(oauthClient, {
			fields: [oauthClientScope.clientId],
			references: [oauthClient.id],
		}),
		scope: one(oauthScope, {
			fields: [oauthClientScope.scopeId],
			references: [oauthScope.id],
		}),
	}),
);

export const oauthTokenRelations = relations(oauthToken, ({ one, many }) => ({
	client: one(oauthClient, {
		fields: [oauthToken.clientId],
		references: [oauthClient.id],
	}),
	user: one(users, {
		fields: [oauthToken.userId],
		references: [users.id],
	}),
	scopes: many(oauthTokenScope),
}));

export const oauthTokenScopeRelations = relations(
	oauthTokenScope,
	({ one }) => ({
		token: one(oauthToken, {
			fields: [oauthTokenScope.tokenId],
			references: [oauthToken.id],
		}),
		scope: one(oauthScope, {
			fields: [oauthTokenScope.scopeId],
			references: [oauthScope.id],
		}),
	}),
);

export const oauthProviderRelations = relations(oauthProvider, ({ many }) => ({
	connections: many(oauthConnection),
}));

export const oauthConnectionRelations = relations(
	oauthConnection,
	({ one }) => ({
		provider: one(oauthProvider, {
			fields: [oauthConnection.providerId],
			references: [oauthProvider.id],
		}),
		user: one(users, {
			fields: [oauthConnection.userId],
			references: [users.id],
		}),
	}),
);
