import { GRADE_IDS } from "@idp/schema/entity/grade";

export const GRADE_CATEGORIES = [
	{
		label: "学部 (Bachelor)",
		identifier: [GRADE_IDS.B1, GRADE_IDS.B2, GRADE_IDS.B3, GRADE_IDS.B4],
	},
	{ label: "修士 (Master)", identifier: [GRADE_IDS.M1, GRADE_IDS.M2] },
	{
		label: "博士 (Doctor)",
		identifier: [GRADE_IDS.D1, GRADE_IDS.D2, GRADE_IDS.D3],
	},
	{ label: "その他", identifier: [GRADE_IDS.ALUMNI, GRADE_IDS.GUEST] },
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
