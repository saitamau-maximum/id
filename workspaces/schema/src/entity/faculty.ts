import * as v from "valibot";

export const FACULTY_IDS = {
	LIBERAL_ARTS: 1,
	ECONOMICS: 2,
	EDUCATION: 3,
	SCIENCE: 4,
	ENGINEERING: 5,
} as const;

// もし FACULTY_IDS の値が重複していた場合、サーバーを起動する前にエラーを出す
const FACULTY_IDS_VALUES = Object.values(FACULTY_IDS);
if (new Set(FACULTY_IDS_VALUES).size !== FACULTY_IDS_VALUES.length) {
	throw new Error("Faculty ID は重複してはいけません");
}

export const FacultyId = v.union(
	FACULTY_IDS_VALUES.map((facultyId) => v.literal(facultyId)),
);
export type FacultyId = v.InferOutput<typeof FacultyId>;

export const Faculty = v.object({
	id: FacultyId,
	name: v.string(),
});
export type Faculty = v.InferOutput<typeof Faculty>;

export const FACULTY_BY_ID = {
	[FACULTY_IDS.LIBERAL_ARTS]: {
		id: FACULTY_IDS.LIBERAL_ARTS,
		name: "教養学部",
	},
	[FACULTY_IDS.ECONOMICS]: { id: FACULTY_IDS.ECONOMICS, name: "経済学部" },
	[FACULTY_IDS.EDUCATION]: { id: FACULTY_IDS.EDUCATION, name: "教育学部" },
	[FACULTY_IDS.SCIENCE]: { id: FACULTY_IDS.SCIENCE, name: "理学部" },
	[FACULTY_IDS.ENGINEERING]: { id: FACULTY_IDS.ENGINEERING, name: "工学部" },
} as const satisfies Record<FacultyId, Faculty>;
