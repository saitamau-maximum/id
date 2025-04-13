import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";
import { getUserFromDisplayIdPrompt } from "./common/get-user-from-display-id-prompt";

export const resetUser = async (client: DrizzleD1Database<typeof schema>) => {
	const user = await getUserFromDisplayIdPrompt(client);
	if (!user) return;

	await client.delete(schema.users).where(eq(schema.users.id, user.userId));
};
