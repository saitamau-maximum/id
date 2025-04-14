import {
	SOCIAL_SERVICES_IDS,
	SOCIAL_SERVICES,
	type SocialServiceId,
} from "../constant";

export const detectSocialService = (url: string) => {
	if (!URL.canParse(url)) {
		return SOCIAL_SERVICES_IDS.OTHER;
	}
	const host = new URL(url).host;
	const socialService = SOCIAL_SERVICES.find(
		(service) => service.host === host,
	)?.id;

	if (socialService) {
		return socialService;
	}
	// SOCIAL_SERVICES_HOST_NAMESにない場合はOTHERを返す
	return SOCIAL_SERVICES_IDS.OTHER;
};

export const getHandle = (url: string, service: SocialServiceId) => {
	const u = new URL(url);
	const prefix = SOCIAL_SERVICES.find((s) => s.id === service)?.prefix || "";
	if (service === SOCIAL_SERVICES_IDS.OTHER) {
		return u.href.replace(/^(https?:\/\/)?/, "").split("/")[0];
	}

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
