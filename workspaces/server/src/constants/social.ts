export const SOCIAL_SERVICES_IDS = {
	GITHUB: 1,
	DISCORD: 2,
	ATCODER: 3,
	X: 4,
	CODEFORCES: 5,
	CODINGAME: 6,
	AOJ: 7,
	OTHER: 999, // あとから増えても被らないよう遠い値を設定
};

export const SOCIAL_SERVICES_HOST_NAMES = [
	{id: SOCIAL_SERVICES_IDS.GITHUB, host: "github.com"},
	{id: SOCIAL_SERVICES_IDS.DISCORD, host: "discord.com"},
	{id: SOCIAL_SERVICES_IDS.ATCODER, host: "atcoder.jp"},
	{id: SOCIAL_SERVICES_IDS.X, host: "x.com"},
	{id: SOCIAL_SERVICES_IDS.CODEFORCES, host: "codeforces.com"},
	{id: SOCIAL_SERVICES_IDS.CODINGAME, host: "codingame.com"},
	{id: SOCIAL_SERVICES_IDS.AOJ, host: "atcoder.jp"},
];

export const SOCIAL_SERVICE_BY_ID = {
	[SOCIAL_SERVICES_IDS.GITHUB]: "GitHub",
	[SOCIAL_SERVICES_IDS.DISCORD]: "Discord",
	[SOCIAL_SERVICES_IDS.ATCODER]: "AtCoder",
	[SOCIAL_SERVICES_IDS.X]: "X",
	[SOCIAL_SERVICES_IDS.CODEFORCES]: "Codeforces",
	[SOCIAL_SERVICES_IDS.CODINGAME]: "CodinGame",
	[SOCIAL_SERVICES_IDS.AOJ]: "AOJ",
	[SOCIAL_SERVICES_IDS.OTHER]: "Other",
};
