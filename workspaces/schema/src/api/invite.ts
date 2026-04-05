import * as v from "valibot";
import { InviteWithIssuer } from "../entity/invite";

export const InviteCreateParams = v.pipe(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),
		expiresAt: v.optional(v.pipe(v.string(), v.isoTimestamp())),
		remainingUse: v.optional(v.pipe(v.number(), v.minValue(1))),
	}),
	v.check((data) => {
		// 招待リンクは expiresAt と remainingUse のどちらか一方が必須（共存可能）
		if (!data.expiresAt && !data.remainingUse) {
			return false;
		}
		return true;
	}),
);
export type InviteCreateParams = v.InferOutput<typeof InviteCreateParams>;

export const GetInvitesResponse = v.array(InviteWithIssuer);
export type GetInvitesResponse = v.InferOutput<typeof GetInvitesResponse>;
