export const JWT_STORAGE_KEY = "jwt";

export const GRADE = [
	{ label: "学部 (Bachelor)", identifier: ["B1", "B2", "B3", "B4"] },
	{ label: "修士 (Master)", identifier: ["M1", "M2"] },
	{ label: "博士 (Doctor)", identifier: ["D1", "D2", "D3"] },
	{ label: "その他", identifier: ["卒業生", "ゲスト"] },
];

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
	OTHER: 999, // あとから増えてもいいように遠い値にする
} as const;

export type SocialServiceId =
	(typeof SOCIAL_SERVICES_IDS)[keyof typeof SOCIAL_SERVICES_IDS];

export const SOCIAL_SERVICES = [
	{
		id: SOCIAL_SERVICES_IDS.GITHUB,
		host: "github.com",
		prefix: "https://github.com/",
	},
	{
		id: SOCIAL_SERVICES_IDS.ATCODER,
		host: "atcoder.jp",
		prefix: "https://atcoder.jp/users/",
	},
	{ id: SOCIAL_SERVICES_IDS.X, host: "x.com", prefix: "https://x.com/" },
	{
		id: SOCIAL_SERVICES_IDS.CODEFORCES,
		host: "codeforces.com",
		prefix: "https://codeforces.com/profile/",
	},
	{
		id: SOCIAL_SERVICES_IDS.INSTAGRAM,
		host: "www.instagram.com",
		prefix: "https://www.instagram.com/",
	},
	{
		id: SOCIAL_SERVICES_IDS.KAGGLE,
		host: "www.kaggle.com",
		prefix: "https://www.kaggle.com/",
	},
	{
		id: SOCIAL_SERVICES_IDS.ZENN,
		host: "zenn.dev",
		prefix: "https://zenn.dev/",
	},
	{
		id: SOCIAL_SERVICES_IDS.QIITA,
		host: "qiita.com",
		prefix: "https://qiita.com/",
	},
	{ id: SOCIAL_SERVICES_IDS.OTHER, host: "other" },
];

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
	[SOCIAL_SERVICES_IDS.OTHER]: {
		src: "/globe.svg",
		alt: "Other",
	},
};
