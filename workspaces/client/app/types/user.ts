import type { UserCertification } from "./certification";
import type { Role } from "./role";

/**
 * Userは公開情報と非公開情報を持つ。
 */
export type User = {
	id: string;
	initializedAt?: Date;
	lastPaymentConfirmedAt?: Date;
	isProvisional: boolean;
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
	bio?: string;
	socialLinks?: string[];
	updatedAt?: Date;
};

export type UserWithCertifications = User & {
	certifications: UserCertification[];
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
	| "roles"
	| "displayName"
	| "realName"
	| "realNameKana"
	| "displayId"
	| "profileImageURL"
	| "grade"
	| "bio"
	| "socialLinks"
>;

export type MemberWithCertifications = Member & {
	certifications: UserCertification[];
};
