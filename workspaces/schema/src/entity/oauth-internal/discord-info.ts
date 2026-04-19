import * as v from "valibot";

export const NotLinked = v.object({
	status: v.literal("not_linked"),
});
export type NotLinked = v.InferOutput<typeof NotLinked>;

export const NotJoined = v.object({
	status: v.literal("not_joined"),
});
export type NotJoined = v.InferOutput<typeof NotJoined>;

export const Joined = v.object({
	status: v.literal("joined"),
	displayName: v.string(),
});
export type Joined = v.InferOutput<typeof Joined>;

export const DiscordInfo = v.union([NotLinked, NotJoined, Joined]);
export type DiscordInfo = v.InferOutput<typeof DiscordInfo>;

export const DiscordInviteResult = v.union([
	v.literal("failed"),
	v.literal("already_joined"),
	v.literal("added"),
]);
export type DiscordInviteResult = v.InferOutput<typeof DiscordInviteResult>;
