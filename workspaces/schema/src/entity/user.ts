import * as v from "valibot";
import { Certification } from "./certification";
import { ExportableOAuthConnection } from "./oauth-connection";
import { Role } from "./role";

/**
 * Userのプロフィール情報
 */
export const UserProfile = v.object({
	displayName: v.string(),
	realName: v.string(),
	realNameKana: v.string(),
	displayId: v.string(),
	profileImageURL: v.string(),
	academicEmail: v.string(),
	email: v.string(),
	studentId: v.string(),
	grade: v.string(),
	faculty: v.optional(v.string()),
	department: v.optional(v.string()),
	laboratory: v.optional(v.string()),
	graduateSchool: v.optional(v.string()),
	specialization: v.optional(v.string()),
	bio: v.string(),
	socialLinks: v.array(v.string()),
	updatedAt: v.date(),
});

export type UserProfile = v.InferOutput<typeof UserProfile>;

/**
 * Userの全ての情報
 *
 * 他会員への公開情報だけでいい場合はMemberを使うこと
 */
export const User = v.object({
	id: v.string(),
	initializedAt: v.nullable(v.date()),
	// 現状は authMiddleware を介しているため招待コードを載せる実装にしてもよいが、
	// 将来的に public API から招待コードが外部に漏洩するリスクを考慮し "仮登録か？" 状態だけ返すようにする
	isProvisional: v.boolean(),
	lastPaymentConfirmedAt: v.nullable(v.date()),
	lastLoginAt: v.optional(v.date()),
	roles: v.array(Role),
	certifications: v.array(Certification),
	oauthConnections: v.array(ExportableOAuthConnection),
	...v.partial(UserProfile).entries,
});

export type User = v.InferOutput<typeof User>;

export const DashboardUser = v.pick(User, [
	"id",
	"initializedAt",
	"lastLoginAt",
	"isProvisional",
	"grade",
	"roles",
]);

export type DashboardUser = v.InferOutput<typeof DashboardUser>;
