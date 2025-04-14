import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";
import { getUserFromDisplayIdPrompt } from "./common/get-user-from-display-id-prompt";

export const resetRegister = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	const user = await getUserFromDisplayIdPrompt(client);
	if (!user) return;

	// ユーザーの初期登録時間を削除 (未初期化状態にするが、プロフィール情報は残す)
	// こうすることで、デバッグ時に初期登録リセットをしてもプロフィール情報が補完されるので便利
	await client
		.update(schema.users)
		.set({ initializedAt: null })
		.where(eq(schema.users.id, user.userId));

	// ユーザーのOAuthコネクションを削除
	await client
		.delete(schema.oauthConnections)
		.where(eq(schema.oauthConnections.userId, user.userId));

	console.log("ユーザーの初期登録状態をリセットしました");
};
