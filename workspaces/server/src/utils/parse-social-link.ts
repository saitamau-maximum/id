import { SOCIAL_SERVICES_IDS, SOCIAL_SERVICES_HOST_NAMES } from "../constants/social";

export const detectProviderId = (url: string) => {
	const host = new URL(url).host;
	const providerId = SOCIAL_SERVICES_HOST_NAMES.find(
		(service) => service.host === host,
	)?.id;

	if (providerId) {
		return providerId;
	}
	// SOCIAL_SERVICES_HOST_NAMESにない場合はOTHERを返す
	return SOCIAL_SERVICES_IDS.OTHER;
}

// URLをパースして、handleとproviderIdを取得する
export const parseSocialLink = (url: string) => {
	const providerId = detectProviderId(url);

	const u = new URL(url);
	if (providerId === SOCIAL_SERVICES_IDS.OTHER) {
		return {
			providerId,
			handle: u.href.replace(/^(https?:\/\/)?/, "").split("/")[0],
      url
		}
	}
	
	return {
		providerId,
		handle: u.pathname.slice(1),
    url
	}
}
