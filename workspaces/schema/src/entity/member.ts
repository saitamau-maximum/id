import * as v from "valibot";
import { User } from "./user";

/**
 * Memberの情報
 *
 * Userのうち、会員である他人に見せても良いPublicな情報
 */
export const Member = v.pick(User, [
	"id",
	"initializedAt",
	"isProvisional",
	"lastPaymentConfirmedAt",
	"lastLoginAt",
	"roles",
	"displayName",
	"realName",
	"realNameKana",
	"displayId",
	"profileImageURL",
	"grade",
	"bio",
	"socialLinks",
	"certifications",
	"oauthConnections",
]);

export type Member = v.InferOutput<typeof Member>;

/**
 * Member のうち、さらにメンバー以外の人に見せても良い Public な情報
 */
export const PublicMember = v.pick(Member, [
	"id",
	"displayName",
	"displayId",
	"profileImageURL",
	"bio",
	"socialLinks",
	"roles",
]);

export type PublicMember = v.InferOutput<typeof PublicMember>;
