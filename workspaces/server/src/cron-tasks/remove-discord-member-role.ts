import type { Context } from "hono";
import type { HonoEnv } from "../factory";
import { getFiscalYear } from "../utils/date";

const getCurrentFiscalYearStartAt = (): Date => {
	const fiscalYearStartYear = getFiscalYear(new Date());

	// 現在属している年度の 4/1 00:00 JST
	return new Date(Date.UTC(fiscalYearStartYear, 2, 31, 15, 0, 0));
};

// 6/1 00:00 JST に実行される
// 今年度の会費入金確認がないユーザーから Discord のメンバーロールを剥奪する
// (5/1 00:00 に IdP の MEMBER ロール削除済みのユーザーが対象)
export const removeDiscordMemberRoleTask = async (c: Context<HonoEnv>) => {
	const UserRepository = c.get("UserRepository");
	const DiscordBotRepository = c.get("DiscordBotRepository");
	const fiscalYearStartAt = getCurrentFiscalYearStartAt();

	const memberRoleId = c.env.DISCORD_MEMBER_ROLE_ID;
	if (!memberRoleId) {
		console.warn(
			"DISCORD_MEMBER_ROLE_ID is not set, skipping Discord role update",
		);
		return;
	}

	try {
		const discordUserIds =
			await UserRepository.fetchDiscordUserIdsOfExpiredMembers(
				fiscalYearStartAt,
			);

		for (const discordUserId of discordUserIds) {
			try {
				const member = await DiscordBotRepository.getGuildMember(discordUserId);
				if (!member) continue;

				await DiscordBotRepository.removeRoleFromMember(
					discordUserId,
					memberRoleId,
				);
			} catch (error) {
				console.error(
					`Failed to remove Discord role for ${discordUserId}:`,
					error,
				);
			}
		}

		console.log(
			`removeDiscordMemberRoleTask: Discord member role removed for ${discordUserIds.length} users`,
		);
	} catch (error) {
		console.error("Error in removeDiscordMemberRoleTask:", error);
	}
};
