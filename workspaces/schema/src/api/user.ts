import * as v from "valibot";
import { UserProfile } from "../entity/user";

export const UserRegisterParams = v.object({
	displayName: UserProfile.entries.displayName,
	realName: UserProfile.entries.realName,
	realNameKana: UserProfile.entries.realNameKana,
	displayId: UserProfile.entries.displayId,
	email: UserProfile.entries.email,
	academicEmail: v.optional(UserProfile.entries.academicEmail),
	studentId: v.optional(UserProfile.entries.studentId),
	grade: UserProfile.entries.grade,
});
export type UserRegisterParams = v.InferOutput<typeof UserRegisterParams>;

export const UserProfileUpdateParams = v.object({
	displayName: UserProfile.entries.displayName,
	realName: UserProfile.entries.realName,
	realNameKana: UserProfile.entries.realNameKana,
	displayId: UserProfile.entries.displayId,
	academicEmail: v.optional(UserProfile.entries.academicEmail),
	email: UserProfile.entries.email,
	studentId: v.optional(UserProfile.entries.studentId),
	grade: UserProfile.entries.grade,
	bio: UserProfile.entries.bio,
	socialLinks: UserProfile.entries.socialLinks,
});
export type UserProfileUpdateParams = v.InferOutput<
	typeof UserProfileUpdateParams
>;

export const UserGetContributionsResponse = v.object({
	weeks: v.array(
		v.array(
			v.object({
				date: v.string(),
				rate: v.number(),
			}),
		),
	),
});
export type UserGetContributionsResponse = v.InferOutput<
	typeof UserGetContributionsResponse
>;
