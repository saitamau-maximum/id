import * as v from "valibot";
import { FACULTY_IDS, FacultyId } from "./faculty";

export const DEPARTMENT_IDS = {
	// 教養学部
	GLOBAL_GOVERNANCE: 101,
	MODERN_SOCIETY: 102,
	PHILOSOPHY_HISTORY: 103,
	EUROPE_AMERICAN_CULTURE: 104,
	JAPANESE_ASIAN_CULTURE: 105,
	COEXISTENCE_CONCEPT: 106,
	// 経済学部: 無
	// 教育学部
	SCHOOL_EDU: 301,
	SUBJECT_EDU: 302,
	SCHOOL_NURSE_TRAINING: 303,
	// 理学部
	MATHEMATICS: 401,
	PHYSICS: 402,
	CHEMISTRY: 403,
	BIOCHEMISTRY: 404,
	REGULATORY_BIOLOGY: 405,
	// 工学部
	MECHANICAL: 501,
	ELECTRIC: 502,
	INFORMATION: 503,
	APPLIED_SCIENCE: 504,
	ENVIRONMENT: 505,
} as const;

// もし DEPARTMENT_IDS の値が重複していた場合、サーバーを起動する前にエラーを出す
const DEPARTMENT_IDS_VALUES = Object.values(DEPARTMENT_IDS);
if (new Set(DEPARTMENT_IDS_VALUES).size !== DEPARTMENT_IDS_VALUES.length) {
	throw new Error("Department ID は重複してはいけません");
}

export const DepartmentId = v.union(
	DEPARTMENT_IDS_VALUES.map((departmentId) => v.literal(departmentId)),
);
export type DepartmentId = v.InferOutput<typeof DepartmentId>;

export const Department = v.object({
	id: DepartmentId,
	facultyId: FacultyId,
	name: v.string(),
});
export type Department = v.InferOutput<typeof Department>;

export const DEPARTMENT_BY_ID = {
	// 教養学部
	[DEPARTMENT_IDS.GLOBAL_GOVERNANCE]: {
		id: DEPARTMENT_IDS.GLOBAL_GOVERNANCE,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "グローバル・ガバナンス専修課程",
	},
	[DEPARTMENT_IDS.MODERN_SOCIETY]: {
		id: DEPARTMENT_IDS.MODERN_SOCIETY,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "現代社会専修課程",
	},
	[DEPARTMENT_IDS.PHILOSOPHY_HISTORY]: {
		id: DEPARTMENT_IDS.PHILOSOPHY_HISTORY,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "哲学歴史専修課程",
	},
	[DEPARTMENT_IDS.EUROPE_AMERICAN_CULTURE]: {
		id: DEPARTMENT_IDS.EUROPE_AMERICAN_CULTURE,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "ヨーロッパ・アメリカ文化専修課程",
	},
	[DEPARTMENT_IDS.JAPANESE_ASIAN_CULTURE]: {
		id: DEPARTMENT_IDS.JAPANESE_ASIAN_CULTURE,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "日本・アジア文化専修課程",
	},
	[DEPARTMENT_IDS.COEXISTENCE_CONCEPT]: {
		id: DEPARTMENT_IDS.COEXISTENCE_CONCEPT,
		facultyId: FACULTY_IDS.LIBERAL_ARTS,
		name: "共生構想専修課程",
	},
	// 経済学部: 無
	// 教育学部
	[DEPARTMENT_IDS.SCHOOL_EDU]: {
		id: DEPARTMENT_IDS.SCHOOL_EDU,
		facultyId: FACULTY_IDS.EDUCATION,
		name: "学校教育コース",
	},
	[DEPARTMENT_IDS.SUBJECT_EDU]: {
		id: DEPARTMENT_IDS.SUBJECT_EDU,
		facultyId: FACULTY_IDS.EDUCATION,
		name: "教科教育コース",
	},
	[DEPARTMENT_IDS.SCHOOL_NURSE_TRAINING]: {
		id: DEPARTMENT_IDS.SCHOOL_NURSE_TRAINING,
		facultyId: FACULTY_IDS.EDUCATION,
		name: "養護教諭養成課程",
	},
	// 理学部
	[DEPARTMENT_IDS.MATHEMATICS]: {
		id: DEPARTMENT_IDS.MATHEMATICS,
		facultyId: FACULTY_IDS.SCIENCE,
		name: "数学科",
	},
	[DEPARTMENT_IDS.PHYSICS]: {
		id: DEPARTMENT_IDS.PHYSICS,
		facultyId: FACULTY_IDS.SCIENCE,
		name: "物理学科",
	},
	[DEPARTMENT_IDS.CHEMISTRY]: {
		id: DEPARTMENT_IDS.CHEMISTRY,
		facultyId: FACULTY_IDS.SCIENCE,
		name: "基礎化学科",
	},
	[DEPARTMENT_IDS.BIOCHEMISTRY]: {
		id: DEPARTMENT_IDS.BIOCHEMISTRY,
		facultyId: FACULTY_IDS.SCIENCE,
		name: "分子生物学科",
	},
	[DEPARTMENT_IDS.REGULATORY_BIOLOGY]: {
		id: DEPARTMENT_IDS.REGULATORY_BIOLOGY,
		facultyId: FACULTY_IDS.SCIENCE,
		name: "生体制御学科",
	},
	// 工学部
	[DEPARTMENT_IDS.MECHANICAL]: {
		id: DEPARTMENT_IDS.MECHANICAL,
		facultyId: FACULTY_IDS.ENGINEERING,
		name: "機械工学・システムデザイン学科",
	},
	[DEPARTMENT_IDS.ELECTRIC]: {
		id: DEPARTMENT_IDS.ELECTRIC,
		facultyId: FACULTY_IDS.ENGINEERING,
		name: "電気電子物理工学科",
	},
	[DEPARTMENT_IDS.INFORMATION]: {
		id: DEPARTMENT_IDS.INFORMATION,
		facultyId: FACULTY_IDS.ENGINEERING,
		name: "情報工学科",
	},
	[DEPARTMENT_IDS.APPLIED_SCIENCE]: {
		id: DEPARTMENT_IDS.APPLIED_SCIENCE,
		facultyId: FACULTY_IDS.ENGINEERING,
		name: "応用化学科",
	},
	[DEPARTMENT_IDS.ENVIRONMENT]: {
		id: DEPARTMENT_IDS.ENVIRONMENT,
		facultyId: FACULTY_IDS.ENGINEERING,
		name: "環境社会デザイン学科",
	},
} as const satisfies Record<DepartmentId, Department>;
