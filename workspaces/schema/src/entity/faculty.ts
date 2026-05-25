import * as v from "valibot";

export const FACULTY_IDS = {
	LIBERAL_ARTS: 1,
	ECONOMICS: 2,
	EDUCATION: 3,
	SCIENCE: 4,
	ENGINEERING: 5,
} as const;

export const FacultyId = v.union(
	Object.values(FACULTY_IDS).map((facultyId) => v.literal(facultyId)),
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

export function toFacultyId(val: number | string): FacultyId;
export function toFacultyId(val: undefined | null): undefined;
export function toFacultyId(
	val: number | string | undefined | null,
): FacultyId | undefined;
export function toFacultyId(
	val: number | string | undefined | null,
): FacultyId | undefined {
	if (typeof val === "number") {
		return v.parse(FacultyId, val);
	}
	if (typeof val === "string") {
		return v.parse(v.pipe(v.string(), v.toNumber(), FacultyId), val);
	}
	if (val === undefined || val === null) {
		return undefined;
	}
	throw new Error("not implemented");
}
