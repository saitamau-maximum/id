import { relations } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "../app";

// Maximum IdP OAuthプロバイダを利用して外部連携アプリにログインするための、OAuth Provider関連のスキーマ

export const oauthClients = sqliteTable("oauth_clients", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	logoUrl: text("logo_url"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => users.id),
});

export const oauthClientManagers = sqliteTable(
	"oauth_client_managers",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClients.id),
		userId: text("user_id")
			.notNull()
			.references(() => users.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.userId] }),
	}),
);

export const oauthClientSecrets = sqliteTable(
	"oauth_client_secrets",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClients.id),
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

export const oauthClientCallbacks = sqliteTable(
	"oauth_client_callbacks",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClients.id),
		callbackUrl: text("callback_url").notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.callbackUrl] }),
	}),
);

export const oauthClientScopes = sqliteTable(
	"oauth_client_scopes",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClients.id),
		scopeId: int("scope_id", { mode: "number" }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.clientId, table.scopeId] }),
	}),
);

export const oauthTokens = sqliteTable("oauth_tokens", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	clientId: text("client_id")
		.notNull()
		.references(() => oauthClients.id),
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

export const oauthTokenScopes = sqliteTable(
	"oauth_token_scopes",
	{
		tokenId: int("token_id", { mode: "number" })
			.notNull()
			.references(() => oauthTokens.id),
		scopeId: int("scope_id", { mode: "number" }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.tokenId, table.scopeId] }),
	}),
);

// ---------- OAuth Relations ---------- //

export const oauthClientsRelations = relations(
	oauthClients,
	({ one, many }) => ({
		owner: one(users, {
			fields: [oauthClients.ownerId],
			references: [users.id],
		}),
		managers: many(oauthClientManagers),
		secrets: many(oauthClientSecrets),
		callbacks: many(oauthClientCallbacks),
		scopes: many(oauthClientScopes),
	}),
);

export const oauthClientManagersRelations = relations(
	oauthClientManagers,
	({ one }) => ({
		client: one(oauthClients, {
			fields: [oauthClientManagers.clientId],
			references: [oauthClients.id],
		}),
		user: one(users, {
			fields: [oauthClientManagers.userId],
			references: [users.id],
		}),
	}),
);

export const oauthClientSecretsRelations = relations(
	oauthClientSecrets,
	({ one }) => ({
		client: one(oauthClients, {
			fields: [oauthClientSecrets.clientId],
			references: [oauthClients.id],
		}),
		issuer: one(users, {
			fields: [oauthClientSecrets.issuedBy],
			references: [users.id],
		}),
	}),
);

export const oauthClientCallbacksRelations = relations(
	oauthClientCallbacks,
	({ one }) => ({
		client: one(oauthClients, {
			fields: [oauthClientCallbacks.clientId],
			references: [oauthClients.id],
		}),
	}),
);

export const oauthClientScopesRelations = relations(
	oauthClientScopes,
	({ one }) => ({
		client: one(oauthClients, {
			fields: [oauthClientScopes.clientId],
			references: [oauthClients.id],
		}),
	}),
);

export const oauthTokensRelations = relations(oauthTokens, ({ one, many }) => ({
	client: one(oauthClients, {
		fields: [oauthTokens.clientId],
		references: [oauthClients.id],
	}),
	user: one(users, {
		fields: [oauthTokens.userId],
		references: [users.id],
	}),
	scopes: many(oauthTokenScopes),
}));

export const oauthTokenScopesRelations = relations(
	oauthTokenScopes,
	({ one }) => ({
		token: one(oauthTokens, {
			fields: [oauthTokenScopes.tokenId],
			references: [oauthTokens.id],
		}),
	}),
);
