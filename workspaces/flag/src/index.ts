const FLAGS_DEFAULT = {
	ENABLE_LOGIN: true,
	ENABLE_OAUTH_REGISTRATION: false,
};

export const DEV_FLAGS = {
	...FLAGS_DEFAULT,
	ENABLE_OAUTH_REGISTRATION: true,
};

export const PROD_FLAGS = {
	...FLAGS_DEFAULT,
};
