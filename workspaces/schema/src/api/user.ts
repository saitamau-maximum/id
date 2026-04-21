import * as v from "valibot";
import { Contributions } from "../entity/contribution";
import { UserProfile } from "../entity/user";

export const UserRegisterParams = v.pipe(
	v.object({
		displayName: UserProfile.entries.displayName,
		realName: UserProfile.entries.realName,
		realNameKana: UserProfile.entries.realNameKana,
		displayId: UserProfile.entries.displayId,
		email: UserProfile.entries.email,
		academicEmail: v.optional(UserProfile.entries.academicEmail),
		studentId: v.optional(UserProfile.entries.studentId),
		grade: UserProfile.entries.grade,
		faculty: v.optional(UserProfile.entries.faculty),
		department: v.optional(UserProfile.entries.department),
		laboratory: v.optional(UserProfile.entries.laboratory),
		graduateSchool: v.optional(UserProfile.entries.graduateSchool),
		specialization: v.optional(UserProfile.entries.specialization),
	}),
	v.partialCheck(
		[["grade"], ["academicEmail"], ["studentId"]],
		({ grade, academicEmail, studentId }) => {
			// もしgradeが卒業生かゲストでないなら、academicEmailとstudentIdは必須
			if (grade !== "卒業生" && grade !== "ゲスト") {
				if (!academicEmail || !studentId) {
					return false;
				}
			}
			return true;
		},
		"大学メールアドレスと学籍番号は必須です",
	),
);
export type UserRegisterParams = v.InferOutput<typeof UserRegisterParams>;

export const UserProfileUpdateParams = v.pipe(
	v.object({
		displayName: UserProfile.entries.displayName,
		realName: UserProfile.entries.realName,
		realNameKana: UserProfile.entries.realNameKana,
		displayId: UserProfile.entries.displayId,
		email: UserProfile.entries.email,
		academicEmail: v.optional(UserProfile.entries.academicEmail),
		studentId: v.optional(UserProfile.entries.studentId),
		grade: UserProfile.entries.grade,
		bio: UserProfile.entries.bio,
		socialLinks: UserProfile.entries.socialLinks,
		faculty: v.optional(UserProfile.entries.faculty),
		department: v.optional(UserProfile.entries.department),
		laboratory: v.optional(UserProfile.entries.laboratory),
		graduateSchool: v.optional(UserProfile.entries.graduateSchool),
		specialization: v.optional(UserProfile.entries.specialization),
	}),
	v.partialCheck(
		[["grade"], ["academicEmail"], ["studentId"]],
		({ grade, academicEmail, studentId }) => {
			// もしgradeが卒業生かゲストでないなら、academicEmailとstudentIdは必須
			if (grade !== "卒業生" && grade !== "ゲスト") {
				if (!academicEmail || !studentId) {
					return false;
				}
			}
			return true;
		},
		"大学メールアドレスと学籍番号は必須です",
	),
);
export type UserProfileUpdateParams = v.InferOutput<
	typeof UserProfileUpdateParams
>;

export const UserGetContributionsResponse = Contributions;
export type UserGetContributionsResponse = v.InferOutput<
	typeof UserGetContributionsResponse
>;
