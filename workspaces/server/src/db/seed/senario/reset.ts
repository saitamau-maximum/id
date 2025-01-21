import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";

export const reset = async (client: DrizzleD1Database<typeof schema>) => {
	// external oauth
	await client.delete(schema.oauthClientCallbacks).run();
	await client.delete(schema.oauthClientScopes).run();
	await client.delete(schema.oauthClientSecrets).run();
	await client.delete(schema.oauthClients).run();
	await client.delete(schema.oauthTokenScopes).run();
	await client.delete(schema.oauthTokens).run();

	// await client.delete(schema.oauthScopes).run(); これは予約テーブルのため削除しない

	// internal oauth
	await client.delete(schema.oauthConnections).run();

	// app
	await client.delete(schema.userProfiles).run();
	await client.delete(schema.userRoles).run();
	await client.delete(schema.users).run();
};
