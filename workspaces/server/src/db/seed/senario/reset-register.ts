import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import prompts from "prompts";
import * as schema from "../../schema";

export const resetRegister = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	const displayIdPrompt = await prompts(
		{
			type: "text",
			name: "userDisplayId",
			message: "初期登録情報を消したいユーザーの displayId を入力してください",
			hint: "@ は含めないでください。 例: saitamau_maximum",
		},
		{
			onCancel() {
				console.error("Prompt canceled");
				process.exit(1);
			},
		},
	);

	const user = await client.query.userProfiles.findFirst({
		where: (profile, { eq }) =>
			eq(profile.displayId, displayIdPrompt.userDisplayId),
	});

	if (!user) {
		console.error("ユーザーが見つかりませんでした");
		console.log(
			"一度 GitHub でログインし、初期登録を行ってから再度実行してください",
		);
		return;
	}

	// ユーザーに紐づくロールを削除
	await client
		.delete(schema.userRoles)
		.where(eq(schema.userRoles.userId, user.userId));

	// ユーザーの初期登録時間を削除 (未初期化状態にするが、プロフィール情報は残す)
	// こうすることで、デバッグ時に初期登録リセットをしてもプロフィール情報が補完されるので便利
	await client
		.update(schema.users)
		.set({ initializedAt: null })
		.where(eq(schema.users.id, user.userId));

	console.log("ユーザーの初期登録状態をリセットしました");
};
