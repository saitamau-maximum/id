import * as v from "valibot";
import { OIDCUserInfo } from "../../entity/oauth-external/oidc-userinfo";
import { User } from "../../entity/user";

export const AuthUserResponse = v.object({
	id: User.entries.id,
	display_id: User.entries.displayId,
	display_name: User.entries.displayName,
	profile_image_url: User.entries.profileImageURL,
	roles: v.array(v.string()),
});
export type AuthUserResponse = v.InferOutput<typeof AuthUserResponse>;

export const UserInfoResponse = OIDCUserInfo;
export type UserInfoResponse = v.InferOutput<typeof UserInfoResponse>;
