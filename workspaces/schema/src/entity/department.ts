import * as v from "valibot";

export const FACULTY_IDS = {
	LIBERAL_ARTS: 1,
	ECONOMICS: 2,
	EDUCATION: 3,
	SCIENCE: 4,
	ENGINEERING: 5,
} as const;

export const DEPARTMENT_IDS = {
	// 教養学部
	GLOBAL_GOVERNANCE: 100,
	MODERN_SOCIETY: 101,
	PHILOSOPHY_HISTORY: 102,
	EUROPE_AMERICAN_CULTURE: 103,
	JAPANESE_ASIAN_CULTURE: 104,
	COEXISTENCE_CONCEPT: 105,
	// 経済学部: 無
	// 教育学部
	ELEMENTARY_SCHOOL: 300,
	JUNIOR_HIGH_SCHOOL: 301,
	EARLY_CHILDHOOD_EDUCATION: 302,
	SPECIAL_SUPPORT_EDUCATION: 303,
	SCHOOL_NURSE_TRAINING: 304,
	// 理学部
	MATHEMATICS: 400,
	PHYSICS: 401,
	BASIC_SCIENCE: 402,
	MOLECULAR_BIOLOGY: 403,
	BIOLOGICAL_CONTROL: 404,
	// 工学部
	MECHANICAL: 500,
	ELECTRIC: 501,
	INFORMATION: 502,
	APPLIED_SCIENCE: 503,
	ENVIRONMENT: 504,
} as const;

// もし FACULTY_IDS, DEPARTMENT_IDS の値が重複していた場合、サーバーを起動する前にエラーを出す
const FACULTY_IDS_VALUES = Object.values(FACULTY_IDS);
if (new Set(FACULTY_IDS_VALUES).size !== FACULTY_IDS_VALUES.length) {
	throw new Error("Faculty ID は重複してはいけません");
}

const DEPARTMENT_IDS_VALUES = Object.values(DEPARTMENT_IDS);
if (new Set(DEPARTMENT_IDS_VALUES).size !== DEPARTMENT_IDS_VALUES.length) {
	throw new Error("Department ID は重複してはいけません");
}

export const FacultyId = v.union(
	FACULTY_IDS_VALUES.map((facultyId) => v.literal(facultyId)),
);
export type FacultyId = v.InferOutput<typeof FacultyId>;

export const DepartmentId = v.union(
	DEPARTMENT_IDS_VALUES.map((departmentId) => v.literal(departmentId)),
);
export type DepartmentId = v.InferOutput<typeof DepartmentId>;

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

export const Department = v.object({
	id: DepartmentId,
	faculty_id: FacultyId,
	name: v.string(),
});
export type Department = v.InferOutput<typeof Department>;

export const DEPARTMENT_BY_ID = {
	// 教養学部
	[DEPARTMENT_IDS.GLOBAL_GOVERNANCE]: {
		id: DEPARTMENT_IDS.GLOBAL_GOVERNANCE,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "グローバル・ガバナンス専修課程",
	},
	[DEPARTMENT_IDS.MODERN_SOCIETY]: {
		id: DEPARTMENT_IDS.MODERN_SOCIETY,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "現代社会専修課程",
	},
	[DEPARTMENT_IDS.PHILOSOPHY_HISTORY]: {
		id: DEPARTMENT_IDS.PHILOSOPHY_HISTORY,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "哲学歴史専修課程",
	},
	[DEPARTMENT_IDS.EUROPE_AMERICAN_CULTURE]: {
		id: DEPARTMENT_IDS.EUROPE_AMERICAN_CULTURE,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "ヨーロッパ・アメリカ文化専修課程",
	},
	[DEPARTMENT_IDS.JAPANESE_ASIAN_CULTURE]: {
		id: DEPARTMENT_IDS.JAPANESE_ASIAN_CULTURE,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "日本・アジア文化専修課程",
	},
	[DEPARTMENT_IDS.COEXISTENCE_CONCEPT]: {
		id: DEPARTMENT_IDS.COEXISTENCE_CONCEPT,
		faculty_id: FACULTY_IDS.LIBERAL_ARTS,
		name: "共生構想専修課程",
	},
	// 経済学部: 無
	// 教育学部
	[DEPARTMENT_IDS.ELEMENTARY_SCHOOL]: {
		id: DEPARTMENT_IDS.ELEMENTARY_SCHOOL,
		faculty_id: FACULTY_IDS.EDUCATION,
		name: "小学校コース",
	},
	[DEPARTMENT_IDS.JUNIOR_HIGH_SCHOOL]: {
		id: DEPARTMENT_IDS.JUNIOR_HIGH_SCHOOL,
		faculty_id: FACULTY_IDS.EDUCATION,
		name: "中学校コース",
	},
	[DEPARTMENT_IDS.EARLY_CHILDHOOD_EDUCATION]: {
		id: DEPARTMENT_IDS.EARLY_CHILDHOOD_EDUCATION,
		faculty_id: FACULTY_IDS.EDUCATION,
		name: "乳幼児教育コース",
	},
	[DEPARTMENT_IDS.SPECIAL_SUPPORT_EDUCATION]: {
		id: DEPARTMENT_IDS.SPECIAL_SUPPORT_EDUCATION,
		faculty_id: FACULTY_IDS.EDUCATION,
		name: "特別支援教育コース",
	},
	[DEPARTMENT_IDS.SCHOOL_NURSE_TRAINING]: {
		id: DEPARTMENT_IDS.SCHOOL_NURSE_TRAINING,
		faculty_id: FACULTY_IDS.EDUCATION,
		name: "養護教諭養成課程",
	},
	// 理学部
	[DEPARTMENT_IDS.MATHEMATICS]: {
		id: DEPARTMENT_IDS.MATHEMATICS,
		faculty_id: FACULTY_IDS.SCIENCE,
		name: "数学科",
	},
	[DEPARTMENT_IDS.PHYSICS]: {
		id: DEPARTMENT_IDS.PHYSICS,
		faculty_id: FACULTY_IDS.SCIENCE,
		name: "物理学科",
	},
	[DEPARTMENT_IDS.BASIC_SCIENCE]: {
		id: DEPARTMENT_IDS.BASIC_SCIENCE,
		faculty_id: FACULTY_IDS.SCIENCE,
		name: "基礎科学科",
	},
	[DEPARTMENT_IDS.MOLECULAR_BIOLOGY]: {
		id: DEPARTMENT_IDS.MOLECULAR_BIOLOGY,
		faculty_id: FACULTY_IDS.SCIENCE,
		name: "分子生物学科",
	},
	[DEPARTMENT_IDS.BIOLOGICAL_CONTROL]: {
		id: DEPARTMENT_IDS.BIOLOGICAL_CONTROL,
		faculty_id: FACULTY_IDS.SCIENCE,
		name: "生体制御学科",
	},
	// 工学部
	[DEPARTMENT_IDS.MECHANICAL]: {
		id: DEPARTMENT_IDS.MECHANICAL,
		faculty_id: FACULTY_IDS.ENGINEERING,
		name: "機械工学・システムデザイン学科",
	},
	[DEPARTMENT_IDS.ELECTRIC]: {
		id: DEPARTMENT_IDS.ELECTRIC,
		faculty_id: FACULTY_IDS.ENGINEERING,
		name: "電気電子物理工学科",
	},
	[DEPARTMENT_IDS.INFORMATION]: {
		id: DEPARTMENT_IDS.INFORMATION,
		faculty_id: FACULTY_IDS.ENGINEERING,
		name: "情報工学科",
	},
	[DEPARTMENT_IDS.APPLIED_SCIENCE]: {
		id: DEPARTMENT_IDS.APPLIED_SCIENCE,
		faculty_id: FACULTY_IDS.ENGINEERING,
		name: "応用科学科",
	},
	[DEPARTMENT_IDS.ENVIRONMENT]: {
		id: DEPARTMENT_IDS.ENVIRONMENT,
		faculty_id: FACULTY_IDS.ENGINEERING,
		name: "環境・エネルギー工学科",
	},
} as const satisfies Record<DepartmentId, Department>;
