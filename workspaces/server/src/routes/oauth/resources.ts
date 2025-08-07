// OAuth の Resource Owner としての役割を果たすルーティング

import { SCOPES_BY_ID, SCOPE_IDS } from "../../constants/scope";
import { factory } from "../../factory";
import { authByAccessTokenMiddleware } from "../../middleware/oauth";
import { generateSub } from "../../utils/oauth/oidc";

const app = factory.createApp();

interface UserInfo {
	id: string;
	display_id: string | undefined;
	display_name: string | undefined;
	profile_image_url: string | undefined;
	roles: string[];
}

interface OidcBasicUserInfo {
	sub: string;
	updated_at?: number;
}
interface OidcProfile {
	name: string;
	given_name: string;
	family_name: string;
	nickname: string;
	preferred_username: string;
	profile?: string; // TODO: public profile ができたらやる
	picture: string;
	website?: string;
	gender?: string; // まだ持ってない
	zoneinfo: string; // 持ってないがみんな Asia/Tokyo でよさそう
	birthdate?: string; // まだ持ってない
	locale: string; // 持ってないが現状みんな ja-JP
}
interface OidcEmail {
	email: string;
	email_verified: false; // メールアドレス検証はしていないので false 固定
}
// // まだ持ってない
// interface OidcPhone {
// 	phone_number?: string;
// 	phone_number_verified?: boolean;
// }
// interface OidcAddress {
// 	address?: {
// 		formatted?: string;
// 		street_address?: string;
// 		locality: string; // 市町村
// 		region?: string; // 都道府県
// 		postal_code?: string;
// 		country?: string;
// 	};
// }
type OidcUserInfo = OidcBasicUserInfo &
	Partial<OidcProfile> &
	Partial<OidcEmail>;

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

		// openid scope が必要
		if (
			!tokenInfo ||
			!tokenInfo.scopes.includes(SCOPES_BY_ID[SCOPE_IDS.OPENID])
		) {
			return c.text("Unauthorized", 401);
		}

		const userInfo: OidcUserInfo = {
			sub: await generateSub(
				tokenInfo.clientId,
				tokenInfo.userId,
				tokenInfo.accessToken,
			),
		};
		if (tokenInfo.user.profile.updatedAt)
			userInfo.updated_at = Math.floor(
				tokenInfo.user.profile.updatedAt.getTime() / 1000,
			);
		if (tokenInfo.scopes.some((scope) => scope.id === SCOPE_IDS.PROFILE)) {
			if (tokenInfo.user.profile.realName) {
				userInfo.name = tokenInfo.user.profile.realName;
				const [familyName, givenName] =
					tokenInfo.user.profile.realName.split(" ");
				userInfo.given_name = givenName;
				userInfo.family_name = familyName;
			}
			if (tokenInfo.user.profile.displayName)
				userInfo.nickname = tokenInfo.user.profile.displayName;
			if (tokenInfo.user.profile.displayId) {
				userInfo.preferred_username = tokenInfo.user.profile.displayId;
				// userInfo.profile = `https://id.maximum.vc/public/${tokenInfo.user.profile.displayId}`;  // TODO: public profile ができたら
			}
			if (tokenInfo.user.profile.profileImageURL)
				userInfo.picture = tokenInfo.user.profile.profileImageURL;
			if (tokenInfo.user.profile.socialLinks)
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
