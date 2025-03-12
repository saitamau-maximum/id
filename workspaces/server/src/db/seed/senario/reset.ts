import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";

export const reset = async (client: DrizzleD1Database<typeof schema>) => {
	// external oauth
	await client.delete(schema.oauthClientCallbacks);
	await client.delete(schema.oauthClientScopes);
	await client.delete(schema.oauthClientSecrets);
	await client.delete(schema.oauthClients);
	await client.delete(schema.oauthTokenScopes);
	await client.delete(schema.oauthTokens);

	// await client.delete(schema.oauthScopes); これは予約テーブルのため削除しない

	// internal oauth
	await client.delete(schema.oauthConnections);

	// calendar
	await client.delete(schema.calendarEvents);

	// app
	await client.delete(schema.userProfiles);
	await client.delete(schema.userRoles);
	await client.delete(schema.users);
};
