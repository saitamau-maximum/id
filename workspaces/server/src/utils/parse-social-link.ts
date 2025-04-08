import { SOCIAL_SERVICES_IDS, detectProviderId } from "../constants/social";

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
