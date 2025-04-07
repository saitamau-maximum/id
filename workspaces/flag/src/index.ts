const FLAGS_DEFAULT = {
	ENABLE_CERTIFICATION: true, // merged in 2025-03-16
	ENABLE_CALENDAR: true, // merged in 2025-03-28
	ENABLE_INVITE: true, // merged in 2025-04-07
};

export const DEV_FLAGS = {
	...FLAGS_DEFAULT,
};

export const PROD_FLAGS = {
	...FLAGS_DEFAULT,
};
