// OAuth の Resource Owner としての役割を果たすルーティング

import {
	FORBIDDEN_RESPONSE,
	UNAUTHORIZED_RESPONSE,
} from "../../constants/oauth-external";
import { SCOPES_BY_ID, SCOPE_IDS } from "../../constants/scope";
import { factory } from "../../factory";
import { authByAccessTokenMiddleware } from "../../middleware/oauth";
import type { OidcUserInfo } from "../../utils/oauth/constant";
import { generateSub } from "../../utils/oauth/oidc-logic";

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
			return c.text(...UNAUTHORIZED_RESPONSE);
		}

		// read:basic_info が必要
		if (!tokenInfo.scopes.includes(SCOPES_BY_ID[SCOPE_IDS.READ_BASIC_INFO])) {
			return c.text(...FORBIDDEN_RESPONSE);
		}

		// ユーザー情報を返す
		return c.json<UserInfo>({
			id: tokenInfo.user.id,
			display_id: tokenInfo.user.profile.displayId,
			display_name: tokenInfo.user.profile.displayName,
			profile_image_url: tokenInfo.user.profile.profileImageURL,
			roles: tokenInfo.user.roles.map((role) => role.name),
		});
	})
	.all("/userinfo", async (c) => {
		// GET, POST のみ受け付ける
		if (c.req.method !== "GET" && c.req.method !== "POST") {
			return c.text("Method Not Allowed", 405);
		}

		const tokenInfo = c.get("tokenInfo");

		if (!tokenInfo) {
			return c.text(...UNAUTHORIZED_RESPONSE);
		}

		// openid scope が必要
		if (!tokenInfo.scopes.includes(SCOPES_BY_ID[SCOPE_IDS.OPENID])) {
			return c.text(...FORBIDDEN_RESPONSE);
		}

		const userInfo: OidcUserInfo = {
			sub: await generateSub(tokenInfo.clientId, tokenInfo.userId),
		};
		if (tokenInfo.user.profile.updatedAt)
			userInfo.updated_at = Math.floor(
				tokenInfo.user.profile.updatedAt.getTime() / 1000,
			);
		if (tokenInfo.scopes.some((scope) => scope.id === SCOPE_IDS.PROFILE)) {
			if (tokenInfo.user.profile.realName) {
				const [familyName, givenName] =
					tokenInfo.user.profile.realName.split(" ");
				userInfo.given_name = givenName;
				userInfo.family_name = familyName;
			}
			if (tokenInfo.user.profile.displayName) {
				userInfo.name = tokenInfo.user.profile.displayName;
				userInfo.nickname = tokenInfo.user.profile.displayName;
			}
			if (tokenInfo.user.profile.displayId) {
				userInfo.preferred_username = tokenInfo.user.profile.displayId;
				// userInfo.profile = `https://id.maximum.vc/public/${tokenInfo.user.profile.displayId}`;  // TODO: public profile ができたら
			}
			if (tokenInfo.user.profile.profileImageURL)
				userInfo.picture = tokenInfo.user.profile.profileImageURL;
			if (
				tokenInfo.user.profile.socialLinks &&
				Array.isArray(tokenInfo.user.profile.socialLinks) &&
				tokenInfo.user.profile.socialLinks.length > 0
			)
				userInfo.website = tokenInfo.user.profile.socialLinks[0]; // 最初のリンクを website として使用

			userInfo.zoneinfo = "Asia/Tokyo"; // 現状は固定
			userInfo.locale = "ja-JP"; // 現状は固定
		}
		if (tokenInfo.scopes.some((scope) => scope.id === SCOPE_IDS.EMAIL)) {
			if (tokenInfo.user.profile.email) {
				userInfo.email = tokenInfo.user.profile.email;
				userInfo.email_verified = false; // メールアドレス検証はしていないので false 固定
			}
		}

		return c.json(userInfo);
	});

export { route as oauthResourcesRoute };
