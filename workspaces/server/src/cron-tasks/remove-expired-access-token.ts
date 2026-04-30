import type { Context } from "hono";
import type { HonoEnv } from "../factory";

// 毎日 03:00 JST に実行される
// 期限切れの Access Token を削除する
export const removeExpiredAccessTokenTask = async (c: Context<HonoEnv>) => {
	const OAuthExternalRepository = c.get("OAuthExternalRepository");
	try {
		await OAuthExternalRepository.deleteExpiredAccessTokens();
		console.log("Expired access tokens removed successfully.");
	} catch (error) {
		console.error("Error removing expired access tokens:", error);
		// TODO: Discord とかで通知する処理を追加する
	}
};
