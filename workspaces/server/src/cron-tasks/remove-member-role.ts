import type { Context } from "hono";
import type { HonoEnv } from "../factory";
import { getFiscalYear } from "../utils/date";

const getCurrentFiscalYearStartAt = (): Date => {
	const fiscalYearStartYear = getFiscalYear(new Date());

	// 現在属している年度の 4/1 00:00 JST
	return new Date(Date.UTC(fiscalYearStartYear, 2, 31, 15, 0, 0));
};

// 5/1 00:00 JST に実行される
// 今年度の会費入金確認がないユーザーから MEMBER ロールを削除し、Discord のメンバーロールも剥奪する
export const removeMemberRoleTask = async (c: Context<HonoEnv>) => {
	const UserRepository = c.get("UserRepository");
	const DiscordBotRepository = c.get("DiscordBotRepository");
	const fiscalYearStartAt = getCurrentFiscalYearStartAt();

	try {
		// DB 削除前に Discord ユーザー ID を取得する
		const discordUserIds =
			await UserRepository.fetchDiscordUserIdsOfMembersToExpire(
				fiscalYearStartAt,
			);

		const updatedUsersCount =
			await UserRepository.removeMemberRoleFromUsersBefore(fiscalYearStartAt);
		console.log(`removeMemberRoleTask: ${updatedUsersCount} users updated`);

		const memberRoleId = c.env.DISCORD_MEMBER_ROLE_ID;

		if (!memberRoleId) {
			console.warn(
				"DISCORD_MEMBER_ROLE_ID is not set, skipping Discord role update",
			);
			return;
		}

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
					`Failed to update Discord roles for ${discordUserId}:`,
					error,
				);
			}
		}

		console.log(
			`removeMemberRoleTask: Discord member role removed for ${discordUserIds.length} users`,
		);
	} catch (error) {
		console.error("Error in removeMemberRoleTask:", error);
	}
};
