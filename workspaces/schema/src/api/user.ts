import * as v from "valibot";
import { Contributions } from "../entity/contribution";
import { DEPARTMENT_BY_ID, FACULTY_IDS } from "../entity/department";
import { isOutsideGrade } from "../entity/grade";
import { UserProfile } from "../entity/user";

export const UserProfileUpdateParams = v.config(
	v.pipe(
		v.intersect([
			// Required
			v.pick(UserProfile, [
				"displayName",
				"realName",
				"realNameKana",
				"displayId",
				"email",
				"grade",
			]),
			// Optional
			v.partial(
				v.pick(UserProfile, [
					"academicEmail",
					"studentId",
					"faculty",
					"department",
					"laboratory",
					"graduateSchool",
					"specialization",
					"bio",
					"socialLinks",
				]),
			),
		]),
		// もし grade が卒業生かゲストでないなら、 studentId, academicEmail は必須
		v.forward(
			v.partialCheck(
				[["grade"], ["studentId"]],
				({ grade, studentId }) => {
					if (!isOutsideGrade(grade) && !studentId) return false;
					return true;
				},
				"学籍番号は必須です",
			),
			["studentId"],
		),
		v.forward(
			v.partialCheck(
				[["grade"], ["academicEmail"]],
				({ grade, academicEmail }) => {
					if (!isOutsideGrade(grade) && !academicEmail) return false;
					return true;
				},
				"大学メールアドレスは必須です",
			),
			["academicEmail"],
		),
		v.forward(
			v.partialCheck(
				[["grade"], ["faculty"]],
				({ grade, faculty }) => {
					// B1-D3 は学部必須
					if (!isOutsideGrade(grade) && !faculty) return false;
					return true;
				},
				"学部を選択してください",
			),
			["faculty"],
		),
		v.forward(
			v.partialCheck(
				[["grade"], ["faculty"], ["department"]],
				({ grade, faculty, department }) => {
					// B1-D3 の経済学部以外は学科必須
					if (
						!isOutsideGrade(grade) &&
						faculty !== FACULTY_IDS.ECONOMICS &&
						!department
					)
						return false;
					return true;
				},
				"学科を選択してください",
			),
			["department"],
		),
		v.forward(
			v.partialCheck(
				[["faculty"], ["department"]],
				({ faculty, department }) => {
					// データが正しいことを確認
					if (faculty && department) {
						const departmentData = DEPARTMENT_BY_ID[department];
						if (!departmentData) return false;
						if (departmentData.faculty_id !== faculty) return false;
						return true;
					}
					return true;
				},
				"学部・学科の組み合わせが正しくありません",
			),
			["department"],
		),
	),
	// UX 的に、エラーが出て直したら別のエラーが出る...というのは避けたいので、エラー箇所はすべて表示する
	{ abortPipeEarly: false },
);
export type UserProfileUpdateParams = v.InferOutput<
	typeof UserProfileUpdateParams
>;

export const UserGetContributionsResponse = Contributions;
export type UserGetContributionsResponse = v.InferOutput<
	typeof UserGetContributionsResponse
>;
