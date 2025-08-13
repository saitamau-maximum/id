const FLAGS_DEFAULT = {
	ENABLE_INVITE: true, // merged in 2025-04-07
	ENABLE_DISCORD_LOGIN: true, // merged in 2025-07-02
};

export const DEV_FLAGS = {
	...FLAGS_DEFAULT,
};

export const PROD_FLAGS = {
	...FLAGS_DEFAULT,
};
