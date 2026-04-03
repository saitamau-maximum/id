import * as v from "valibot";
import { Contributions } from "../entity/contribution";
import { Member } from "../entity/member";

export const GetMembersResponse = v.array(
	v.omit(Member, ["certifications", "bio", "oauthConnections"]),
);
export type GetMembersResponse = v.InferOutput<typeof GetMembersResponse>;

export const GetMembersContributionByUserDisplayIDResponse = v.object({
	weeks: Contributions,
});
export type GetMembersContributionByUserDisplayIDResponse = v.InferOutput<
	typeof GetMembersContributionByUserDisplayIDResponse
>;

export const GetMembersProfileByUserDisplayIDResponse = Member;
export type GetMembersProfileByUserDisplayIDResponse = v.InferOutput<
	typeof GetMembersProfileByUserDisplayIDResponse
>;
