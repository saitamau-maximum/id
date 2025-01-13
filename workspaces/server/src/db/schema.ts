import { relations } from "drizzle-orm";
import {
	index,
	int,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

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
	},
	(table) => ({
		gradeIdx: index("grade_idx").on(table.grade),
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

// ---------- OAuth 関連 ---------- //

export const oauthClients = sqliteTable("oauth_clients", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	logoUrl: text("logo_url"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => users.id),
});

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

export const oauthScopes = sqliteTable("oauth_scopes", {
	id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	description: text("description"),
});

export const oauthClientScopes = sqliteTable(
	"oauth_client_scopes",
	{
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClients.id),
		scopeId: int("scope_id", { mode: "number" })
			.notNull()
			.references(() => oauthScopes.id),
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
		scopeId: int("scope_id", { mode: "number" })
			.notNull()
			.references(() => oauthScopes.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.tokenId, table.scopeId] }),
	}),
);

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

// ---------- OAuth Relations ---------- //

export const oauthClientsRelations = relations(
	oauthClients,
	({ one, many }) => ({
		owner: one(users, {
			fields: [oauthClients.ownerId],
			references: [users.id],
		}),
		secrets: many(oauthClientSecrets),
		callbacks: many(oauthClientCallbacks),
		scopes: many(oauthClientScopes),
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

export const oauthScopesRelations = relations(oauthScopes, ({ many }) => ({
	clients: many(oauthClientScopes),
	tokens: many(oauthTokenScopes),
}));

export const oauthClientScopesRelations = relations(
	oauthClientScopes,
	({ one }) => ({
		client: one(oauthClients, {
			fields: [oauthClientScopes.clientId],
			references: [oauthClients.id],
		}),
		scope: one(oauthScopes, {
			fields: [oauthClientScopes.scopeId],
			references: [oauthScopes.id],
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
		scope: one(oauthScopes, {
			fields: [oauthTokenScopes.scopeId],
			references: [oauthScopes.id],
		}),
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
