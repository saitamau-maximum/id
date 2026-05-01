import type { Context } from "hono";
import type { HonoEnv } from "../factory";
import { getFiscalYear } from "../utils/date";

const getCurrentFiscalYearStartAt = (): Date => {
	const fiscalYearStartYear = getFiscalYear(new Date());

	// 現在属している年度の 4/1 00:00 JST
	return new Date(Date.UTC(fiscalYearStartYear, 2, 31, 15, 0, 0));
};

// 5/1 00:00 JST に実行される
// 今年度の会費入金確認がないユーザーから MEMBER ロールを削除する
export const removeMemberRoleTask = async (c: Context<HonoEnv>) => {
	const UserRepository = c.get("UserRepository");
	const fiscalYearStartAt = getCurrentFiscalYearStartAt();
	try {
		const updatedUsersCount =
			await UserRepository.removeMemberRoleFromUsersBefore(fiscalYearStartAt);
		console.log(`removeMemberRoleTask: ${updatedUsersCount} users updated`);
	} catch (error) {
		console.error("Error removing member role from expired users:", error);
	}
};
