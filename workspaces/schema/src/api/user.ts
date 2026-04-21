import * as v from "valibot";
import { Contributions } from "../entity/contribution";
import { UserProfile } from "../entity/user";

// TODO: 文字列ではなく enum-like で管理したい
const OUTSIDE_GRADE = ["卒業生", "ゲスト"];
const GRADUATE_GRADE = ["M1", "M2", "D1", "D2", "D3"];

export const UserRegisterParams = v.pipe(
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
			]),
		),
	]),
	// もし grade が卒業生かゲストでないなら、 studentId, academicEmail は必須
	v.forward(
		v.partialCheck(
			[["grade"], ["studentId"]],
			({ grade, studentId }) => {
				if (!OUTSIDE_GRADE.includes(grade) && !studentId) return false;
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
				if (!OUTSIDE_GRADE.includes(grade) && !academicEmail) return false;
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
				// B1-D2 は学部必須
				if (!OUTSIDE_GRADE.includes(grade) && !faculty) return false;
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
				// B1-D2 の経済学部以外は学科必須
				if (
					!OUTSIDE_GRADE.includes(grade) &&
					!GRADUATE_GRADE.includes(grade) &&
					faculty !== "経済学部" &&
					!department
				)
					return false;
				return true;
			},
			"学科を選択してください",
		),
		["department"],
	),
	// M, D 以上は研究室・研究科・専攻必須
	v.forward(
		v.partialCheck(
			[["grade"], ["laboratory"]],
			({ grade, laboratory }) => {
				if (GRADUATE_GRADE.includes(grade) && !laboratory) return false;
				return true;
			},
			"研究室を選択してください",
		),
		["laboratory"],
	),
	v.forward(
		v.partialCheck(
			[["grade"], ["graduateSchool"]],
			({ grade, graduateSchool }) => {
				if (GRADUATE_GRADE.includes(grade) && !graduateSchool) return false;
				return true;
			},
			"研究科を選択してください",
		),
		["graduateSchool"],
	),
	v.forward(
		v.partialCheck(
			[["grade"], ["specialization"]],
			({ grade, specialization }) => {
				if (GRADUATE_GRADE.includes(grade) && !specialization) return false;
				return true;
			},
			"専攻を選択してください",
		),
		["specialization"],
	),
);
export type UserRegisterParams = v.InferOutput<typeof UserRegisterParams>;

// TODO: register とある程度共通化
export const UserProfileUpdateParams = v.pipe(
	v.intersect([
		// Required
		v.pick(UserProfile, [
			"displayName",
			"realName",
			"realNameKana",
			"displayId",
			"email",
			"grade",
			"socialLinks",
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
			]),
		),
	]),
	// もし grade が卒業生かゲストでないなら、 studentId, academicEmail は必須
	v.forward(
		v.partialCheck(
			[["grade"], ["studentId"]],
			({ grade, studentId }) => {
				if (!OUTSIDE_GRADE.includes(grade) && !studentId) return false;
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
				if (!OUTSIDE_GRADE.includes(grade) && !academicEmail) return false;
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
				// B1-D2 は学部必須
				if (!OUTSIDE_GRADE.includes(grade) && !faculty) return false;
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
				// B1-D2 の経済学部以外は学科必須
				if (
					!OUTSIDE_GRADE.includes(grade) &&
					!GRADUATE_GRADE.includes(grade) &&
					faculty !== "経済学部" &&
					!department
				)
					return false;
				return true;
			},
			"学科を選択してください",
		),
		["department"],
	),
	// M, D 以上は研究室・研究科・専攻必須
	v.forward(
		v.partialCheck(
			[["grade"], ["laboratory"]],
			({ grade, laboratory }) => {
				if (GRADUATE_GRADE.includes(grade) && !laboratory) return false;
				return true;
			},
			"研究室を選択してください",
		),
		["laboratory"],
	),
	v.forward(
		v.partialCheck(
			[["grade"], ["graduateSchool"]],
			({ grade, graduateSchool }) => {
				if (GRADUATE_GRADE.includes(grade) && !graduateSchool) return false;
				return true;
			},
			"研究科を選択してください",
		),
		["graduateSchool"],
	),
	v.forward(
		v.partialCheck(
			[["grade"], ["specialization"]],
			({ grade, specialization }) => {
				if (GRADUATE_GRADE.includes(grade) && !specialization) return false;
				return true;
			},
			"専攻を選択してください",
		),
		["specialization"],
	),
);
export type UserProfileUpdateParams = v.InferOutput<
	typeof UserProfileUpdateParams
>;

export const UserGetContributionsResponse = Contributions;
export type UserGetContributionsResponse = v.InferOutput<
	typeof UserGetContributionsResponse
>;
