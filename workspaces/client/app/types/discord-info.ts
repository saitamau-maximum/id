type NotLinkedDiscordInfo = {
	status: "not_linked";
};

type NotJoinedDiscordInfo = {
	status: "not_joined";
};

type JoinedDiscordInfo = {
	status: "joined";
	displayName: string;
};

export type DiscordInfo =
	| NotLinkedDiscordInfo
	| NotJoinedDiscordInfo
	| JoinedDiscordInfo;
