import * as v from "valibot";
import { User } from "./user";

/**
 * Memberの情報
 *
 * Userのうち、会員である他人に見せても良いPublicな情報
 */
export const Member = v.pick(User, [
	"id",
	"displayName",
	"realName",
	"realNameKana",
	"displayId",
	"profileImageURL",
	"grade",
	"bio",
	"socialLinks",
	"certifications",
	"roles",
]);

export type Member = v.InferOutput<typeof Member>;
