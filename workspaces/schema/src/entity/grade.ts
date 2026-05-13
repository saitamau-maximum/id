import * as v from "valibot";

export const GRADE_IDS = {
	B1: 0,
	B2: 1,
	B3: 2,
	B4: 3,
	M1: 4,
	M2: 5,
	D1: 6,
	D2: 7,
	D3: 8,
	ALUMNI: 9,
	GUEST: 10,
} as const;

// もし GRADE_IDS の値が重複していた場合、サーバーを起動する前にエラーを出す
const GRADE_ID_VALUES = Object.values(GRADE_IDS);
if (new Set(GRADE_ID_VALUES).size !== GRADE_ID_VALUES.length) {
	throw new Error("Grade IDは重複してはいけません");
}

export const GradeId = v.union(
	GRADE_ID_VALUES.map((gradeId) => v.literal(gradeId)),
);
export type GradeId = v.InferOutput<typeof GradeId>;

export const Grade = v.object({
	id: GradeId,
	name: v.string(),
});
export type Grade = v.InferOutput<typeof Grade>;

export const GRADE_BY_ID = {
	[GRADE_IDS.B1]: { id: GRADE_IDS.B1, name: "B1" },
	[GRADE_IDS.B2]: { id: GRADE_IDS.B2, name: "B2" },
	[GRADE_IDS.B3]: { id: GRADE_IDS.B3, name: "B3" },
	[GRADE_IDS.B4]: { id: GRADE_IDS.B4, name: "B4" },
	[GRADE_IDS.M1]: { id: GRADE_IDS.M1, name: "M1" },
	[GRADE_IDS.M2]: { id: GRADE_IDS.M2, name: "M2" },
	[GRADE_IDS.D1]: { id: GRADE_IDS.D1, name: "D1" },
	[GRADE_IDS.D2]: { id: GRADE_IDS.D2, name: "D2" },
	[GRADE_IDS.D3]: { id: GRADE_IDS.D3, name: "D3" },
	[GRADE_IDS.ALUMNI]: { id: GRADE_IDS.ALUMNI, name: "卒業生" },
	[GRADE_IDS.GUEST]: { id: GRADE_IDS.GUEST, name: "ゲスト" },
} as const satisfies Record<GradeId, Grade>;

export const UNDERGRADUATE_GRADE = [
	GRADE_IDS.B1,
	GRADE_IDS.B2,
	GRADE_IDS.B3,
	GRADE_IDS.B4,
] as const;

export const GRADUATE_GRADE = [
	GRADE_IDS.M1,
	GRADE_IDS.M2,
	GRADE_IDS.D1,
	GRADE_IDS.D2,
	GRADE_IDS.D3,
] as const;

export const OUTSIDE_GRADE = [GRADE_IDS.ALUMNI, GRADE_IDS.GUEST] as const;

export const isUndergraduateGrade = (
	grade: GradeId,
): grade is (typeof UNDERGRADUATE_GRADE)[number] => {
	return (UNDERGRADUATE_GRADE as ReadonlyArray<GradeId>).includes(grade);
};

export const isGraduateGrade = (
	grade: GradeId,
): grade is (typeof GRADUATE_GRADE)[number] => {
	return (GRADUATE_GRADE as ReadonlyArray<GradeId>).includes(grade);
};

export const isOutsideGrade = (
	grade: GradeId,
): grade is (typeof OUTSIDE_GRADE)[number] => {
	return (OUTSIDE_GRADE as ReadonlyArray<GradeId>).includes(grade);
};
