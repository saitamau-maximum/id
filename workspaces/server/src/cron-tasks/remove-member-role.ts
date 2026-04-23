import { CloudflareUserRepository } from "../infrastructure/repository/cloudflare/user";

const getCurrentFiscalYearStartAt = (): Date => {
	const now = new Date();

	const year = Number(
		new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Tokyo",
			year: "numeric",
		}).format(now),
	);

	// 4/1 00:00 JST
	return new Date(Date.UTC(year, 2, 31, 15, 0, 0));
};

// 4/30 15:00 UTC = 5/1 00:00 JST に実行される
// 今年度の会費入金確認がないユーザーから MEMBER ロールを削除する
export const removeMemberRoleTask = async (env: Env) => {
	const UserRepository = new CloudflareUserRepository(env.DB);
	const fiscalYearStartAt = getCurrentFiscalYearStartAt();
	try {
		const updatedUsersCount =
			await UserRepository.removeMemberRoleFromUsersBefore(fiscalYearStartAt);
		console.log(`removeMemberRoleTask: ${updatedUsersCount} users updated`);
	} catch (error) {
		console.error("Error removing member role from expired users:", error);
	}
};
