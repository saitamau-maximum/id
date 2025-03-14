import type { DrizzleD1Database } from "drizzle-orm/d1";
import prompts from "prompts";
import type * as schema from "../../../schema";

export const getUserFromDisplayIdPrompt = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	const displayIdPrompt = await prompts(
		{
			type: "text",
			name: "userDisplayId",
			message: "あなたの displayId を入力してください",
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

	return user;
};
