import { sql, relations } from 'drizzle-orm'
import {
  check,
  int,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: text('id').primaryKey(), // UUID で生成することを想定(人に対する連番 ID 嫌いなので)
  displayName: text('display_name').notNull(),
  profileImageUrl: text('profile_image_url'),
  // その他の個人情報等は後で追加
})

export const role = sqliteTable(
  'role',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    priority: int('priority', { mode: 'number' }).notNull(),
  },
  table => ({
    checkConstraint: check('nonneg_priority', sql`${table.priority} >= 0`),
  }),
)

export const userRole = sqliteTable(
  'user_role',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    roleId: int('role_id', { mode: 'number' })
      .notNull()
      .references(() => role.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  }),
)

// さすがに client_secret とかは環境変数側に持たせるべき(見れちゃうので)
// → たぶん各々の OAuth ページとかを作ることになりそう
// OAuth の接続情報に対する Reference Provider ID として使う
export const oauthProvider = sqliteTable('oauth_provider', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const oauthConnection = sqliteTable(
  'oauth_connection',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    providerId: int('provider_id', { mode: 'number' })
      .notNull()
      .references(() => oauthProvider.id),
    providerUserId: text('provider_user_id').notNull(), // OAuth Provider 側の User ID
    // 以下取れそうな情報を書く
    email: text('email'),
    name: text('name'),
    profileImageUrl: text('profile_image_url'),
  },
  table => ({
    pk: primaryKey({ columns: [table.userId, table.providerId] }),
  }),
)

// ---------- Relations ---------- //

export const userRelations = relations(user, ({ many }) => ({
  roles: many(role),
  oauthConnections: many(oauthConnection),
}))

export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
}))

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, { fields: [userRole.userId], references: [user.id] }),
  role: one(role, { fields: [userRole.roleId], references: [role.id] }),
}))

export const oauthProviderRelations = relations(oauthProvider, ({ many }) => ({
  connections: many(oauthConnection),
}))

export const oauthConnectionRelations = relations(
  oauthConnection,
  ({ one }) => ({
    user: one(user, {
      fields: [oauthConnection.userId],
      references: [user.id],
    }),
    provider: one(oauthProvider, {
      fields: [oauthConnection.providerId],
      references: [oauthProvider.id],
    }),
  }),
)
