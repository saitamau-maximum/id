import {
	type ManuallyAddableSocialService,
	SOCIAL_SERVICES_IDS,
	SOCIAL_SERVICES_PREFIX,
} from "../constant";

export const detectSocialService = (
	url: string,
): ManuallyAddableSocialService => {
	if (!URL.canParse(url)) {
		return SOCIAL_SERVICES_IDS.OTHER;
	}

	const socialService = Object.entries(SOCIAL_SERVICES_PREFIX).find(
		([_, prefix]) => {
			return url.startsWith(prefix);
		},
	)?.[0];

	if (socialService) {
		return Number.parseInt(socialService) as ManuallyAddableSocialService;
	}
	// SOCIAL_SERVICES_HOST_NAMESにない場合はOTHERを返す
	return SOCIAL_SERVICES_IDS.OTHER;
};

export const getHandle = (
	url: string,
	service: ManuallyAddableSocialService,
) => {
	const u = new URL(url);
	if (service === SOCIAL_SERVICES_IDS.OTHER) {
		return u.hostname;
	}
	const prefix = SOCIAL_SERVICES_PREFIX[service];
	const handle = u.href.replace(prefix, "").split("/")[0];
	return handle;
};

// URLをパースして、handleとproviderIdを取得する
export const parseSocialLink = (url: string) => {
	const service = detectSocialService(url);

	if (service === SOCIAL_SERVICES_IDS.OTHER) {
		return {
			service,
			handle: getHandle(url, service),
			url,
		};
	}

	return {
		service,
		handle: `@${getHandle(url, service)}`,
		url,
	};
};
