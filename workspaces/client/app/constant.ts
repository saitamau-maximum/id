export const JWT_STORAGE_KEY = "jwt";

export const GRADE = [
	{ label: "学部 (Bachelor)", identifier: ["B1", "B2", "B3", "B4"] },
	{ label: "修士 (Master)", identifier: ["M1", "M2"] },
	{ label: "博士 (Doctor)", identifier: ["D1", "D2", "D3"] },
	{ label: "その他", identifier: ["卒業生", "ゲスト"] },
];

export const FACULTY = [
	{
		label: "学部",
		identifier: ["教養学部", "経済学部", "教育学部", "理学部", "工学部"],
	},
];

export const FacultyOfLiberalArts = [
	{
		lable: "教養学部",
		identifier: [
			"グローバル・ガバナンス専修課程",
			"現代社会専修課程",
			"哲学歴史専修課程",
			"ヨーロッパ・アメリカ文化専修課程",
			"日本・アジア文化専修課程",
			"共生構想専修課程",
		],
	},
];

export const FacultyOfEconomics = [];

export const FacultyOfEducation = [
	{
		label: "教育学部",
		identifier: [
			"小学校コース",
			"中学校コース",
			"乳幼児教育コース",
			"特別支援教育コース",
			"養護教諭養成課程",
		],
	},
];

export const FacultyOfScience = [
	{
		label: "理学部",
		identifier: ["数学科", "物理学科", "基礎科学科", "分子生物学科"],
	},
];

export const FacultyOfEngineering = [
	{
		label: "工学部",
		identifier: [
			"機械工学・システムデザイン学科",
			"電気電子物理工学科",
			"情報工学科",
			"応用科学科",
			"環境社会デザイン学科",
		],
	},
];

export const ACADEMIC_EMAIL_DOMAIN = "ms.saitama-u.ac.jp";

export const OUTSIDE_GRADE = ["卒業生", "ゲスト"];

export const RESERVED_WORDS = [
	"maximum",
	"home",
	"calendar",
	"member",
	"members",
	"logout",
	"login",
	"meline",
	"merin",
	"idp",
];

export const SOCIAL_SERVICES_IDS = {
	GITHUB: 1,
	ATCODER: 2,
	X: 3,
	CODEFORCES: 4,
	INSTAGRAM: 5,
	KAGGLE: 6,
	ZENN: 7,
	QIITA: 8,
	DISCORD: 9,
	OTHER: 999, // あとから増えてもいいように遠い値にする
} as const;

export const SOCIAL_SERVICES_PREFIX = {
	[SOCIAL_SERVICES_IDS.GITHUB]: "https://github.com/",
	[SOCIAL_SERVICES_IDS.ATCODER]: "https://atcoder.jp/users/",
	[SOCIAL_SERVICES_IDS.X]: "https://x.com/",
	[SOCIAL_SERVICES_IDS.CODEFORCES]: "https://codeforces.com/profile/",
	[SOCIAL_SERVICES_IDS.INSTAGRAM]: "https://www.instagram.com/",
	[SOCIAL_SERVICES_IDS.KAGGLE]: "https://www.kaggle.com/",
	[SOCIAL_SERVICES_IDS.ZENN]: "https://zenn.dev/",
	[SOCIAL_SERVICES_IDS.QIITA]: "https://qiita.com/",
	[SOCIAL_SERVICES_IDS.OTHER]: "",
	// Discord は OAuth で連携させるため、ここの定義は不要 (ここの値は Settings の SocialLinks で使われるので)
};

export type SocialServiceId =
	(typeof SOCIAL_SERVICES_IDS)[keyof typeof SOCIAL_SERVICES_IDS];

export type ManuallyAddableSocialService = keyof typeof SOCIAL_SERVICES_PREFIX;

export const ICON = {
	[SOCIAL_SERVICES_IDS.GITHUB]: {
		src: "/github.svg",
		alt: "GitHub",
	},
	[SOCIAL_SERVICES_IDS.ATCODER]: {
		src: "/atcoder.svg",
		alt: "AtCoder",
	},
	[SOCIAL_SERVICES_IDS.X]: {
		src: "/x.svg",
		alt: "X",
	},
	[SOCIAL_SERVICES_IDS.CODEFORCES]: {
		src: "/codeforces.svg",
		alt: "Codeforces",
	},
	[SOCIAL_SERVICES_IDS.INSTAGRAM]: {
		src: "/instagram.svg",
		alt: "Instagram",
	},
	[SOCIAL_SERVICES_IDS.KAGGLE]: {
		src: "/kaggle.svg",
		alt: "Kaggle",
	},
	[SOCIAL_SERVICES_IDS.ZENN]: {
		src: "/zenn.svg",
		alt: "Zenn",
	},
	[SOCIAL_SERVICES_IDS.QIITA]: {
		src: "/qiita.svg",
		alt: "Qiita",
	},
	[SOCIAL_SERVICES_IDS.DISCORD]: {
		src: "/discord.svg",
		alt: "Discord",
	},
	[SOCIAL_SERVICES_IDS.OTHER]: {
		src: "/globe.svg",
		alt: "Other",
	},
};
