import { CloudflareOAuthExternalRepository } from "../infrastructure/repository/cloudflare/oauth-external";

// 18:00 UTC (03:00 JST) に実行される
// 期限切れの Access Token を削除する
export const removeExpiredAccessTokenTask = async (env: Env) => {
	const OAuthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
	await OAuthExternalRepository.deleteExpiredAccessTokens()
		.then(() => {
			console.log("Expired access tokens removed successfully.");
		})
		.catch((error) => {
			console.error("Error removing expired access tokens:", error);
			// TODO: Discord とかで通知する処理を追加する
		});
};
