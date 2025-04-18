import * as v from "valibot";
import { Member } from "../entity/member";

export const GetMembersResponse = v.array(
	v.omit(Member, ["certifications", "bio"] as const),
);
export type GetMembersResponse = v.InferOutput<typeof GetMembersResponse>;

export const GetMembersProfileByUserDisplayIDResponse = Member;
export type GetMembersProfileByUserDisplayIDResponse = v.InferOutput<
	typeof GetMembersProfileByUserDisplayIDResponse
>;

export const GetMembersContributionByUserDisplayIDResponse = v.object({
	weeks: v.array(
		v.array(
			v.object({
				date: v.string(),
				rate: v.number(),
			}),
		),
	),
});

export type GetMembersContributionByUserDisplayIDResponse = v.InferOutput<
	typeof GetMembersContributionByUserDisplayIDResponse
>;
