import type { User } from "@idp/schema/entity/user";

/**
 * あくまでもユーザー表示するだけのための軽めの情報
 */
export type UserBasicInfo = Pick<
	User,
	"id" | "displayId" | "displayName" | "profileImageURL"
>;
