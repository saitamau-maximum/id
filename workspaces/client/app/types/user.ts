import type { Role } from "./role";

/**
 * Userは公開情報と非公開情報を持つ。
 */
export type User = {
	id: string;
	initialized: boolean;
	roles: Role[];
	displayName?: string;
	realName?: string;
	realNameKana?: string;
	displayId?: string;
	profileImageURL?: string;
	academicEmail?: string;
	email?: string;
	studentId?: string;
	grade?: string;
};

/**
 * あくまでもユーザー表示するだけのための軽めの情報
 */
export type UserBasicInfo = Pick<
	User,
	"id" | "displayId" | "displayName" | "profileImageURL"
>;

/**
 * MemberはUserと一部同じフィールドを持つが、MemberはUserのうち公開情報のみを持つ。
 */
export type Member = Pick<
	User,
	| "id"
	| "initialized"
	| "roles"
	| "displayName"
	| "realName"
	| "realNameKana"
	| "displayId"
	| "profileImageURL"
	| "grade"
>;
