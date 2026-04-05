import * as v from "valibot";
import { User, UserBasicInfo } from "./user";

export const Invite = v.object({
	id: v.string(),
	title: v.string(),
	expiresAt: v.nullable(v.date()),
	remainingUse: v.nullable(v.number()),
	createdAt: v.date(),
	issuedByUserId: User.entries.id,
});
export type Invite = v.InferOutput<typeof Invite>;

export const InviteWithIssuer = v.object({
	...Invite.entries,
	issuedBy: v.omit(UserBasicInfo, ["roles"]),
});
export type InviteWithIssuer = v.InferOutput<typeof InviteWithIssuer>;
