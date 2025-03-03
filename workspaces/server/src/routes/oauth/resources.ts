// OAuth の Resource Owner としての役割を果たすルーティング

import { SCOPES_BY_ID, SCOPE_IDS } from "../../constants/scope";
import { factory } from "../../factory";
import { authByAccessTokenMiddleware } from "../../middleware/oauth";

const app = factory.createApp();

interface UserInfo {
	id: string;
	display_id: string | undefined;
	display_name: string | undefined;
	profile_image_url: string | undefined;
	roles: string[];
}

const route = app
	.use(authByAccessTokenMiddleware)
	.get("/authuser", async (c) => {
		const tokenInfo = c.get("tokenInfo");

		// tokenInfo が存在しない場合は authByAccessTokenMiddleware で処理されるが、型が合わないので明示的にチェック
		if (!tokenInfo) {
			return c.text("Unauthorized", 401);
		}

		// read:basic_info が必要
		if (!tokenInfo.scopes.includes(SCOPES_BY_ID[SCOPE_IDS.READ_BASIC_INFO])) {
			return c.text("Forbidden", 403);
		}

		// ユーザー情報を返す
		return c.json<UserInfo>({
			id: tokenInfo.user.id,
			display_id: tokenInfo.user.displayId,
			display_name: tokenInfo.user.displayName,
			profile_image_url: tokenInfo.user.profileImageURL,
			roles: tokenInfo.user.roles.map((role) => role.name),
		});
	});

export { route as oauthResourcesRoute };
