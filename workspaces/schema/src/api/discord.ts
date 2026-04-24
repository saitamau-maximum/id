import type * as v from "valibot";
import {
	DiscordInfo,
	DiscordInviteResult,
	Joined,
	NotJoined,
	NotLinked,
} from "../entity/oauth-internal/discord-info";

export const DiscordInfoNotLinkedResponse = NotLinked;
export type DiscordInfoNotLinkedResponse = v.InferOutput<
	typeof DiscordInfoNotLinkedResponse
>;

export const DiscordInfoNotJoinedResponse = NotJoined;
export type DiscordInfoNotJoinedResponse = v.InferOutput<
	typeof DiscordInfoNotJoinedResponse
>;

export const DiscordInfoJoinedResponse = Joined;
export type DiscordInfoJoinedResponse = v.InferOutput<
	typeof DiscordInfoJoinedResponse
>;

export const GetDiscordInfoResponse = DiscordInfo;
export type GetDiscordInfoResponse = v.InferOutput<
	typeof GetDiscordInfoResponse
>;

export const PostInviteDiscordResponse = DiscordInviteResult;
export type PostInviteDiscordResponse = v.InferOutput<
	typeof PostInviteDiscordResponse
>;
