const FLAGS_DEFAULT = {
	ENABLE_LOGIN: true,
	ENABLE_OAUTH_REGISTRATION: true,
	CALENDAR_FLAGS: false,
};

export const DEV_FLAGS = {
	...FLAGS_DEFAULT,
	CALENDAR_FLAGS: true,
};

export const PROD_FLAGS = {
	...FLAGS_DEFAULT,
};
