const FLAGS_DEFAULT = {
	ENABLE_CALENDAR: true, // merged in 2025-03-28
	ENABLE_INVITE: true, // merged in 2025-04-07
	ENABLE_DISCORD_LOGIN: false,
};

export const DEV_FLAGS = {
	...FLAGS_DEFAULT,
	ENABLE_DISCORD_LOGIN: true,
};

export const PROD_FLAGS = {
	...FLAGS_DEFAULT,
};
