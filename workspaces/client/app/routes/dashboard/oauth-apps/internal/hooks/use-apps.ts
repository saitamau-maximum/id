import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useAllApps = () => {
	const { oauthAppsRepository } = useRepository();
	return useQuery({
		queryKey: oauthAppsRepository.getApps$$key(),
		queryFn: oauthAppsRepository.getApps,
	});
};

export const useApp = (appId: string) => {
	const { oauthAppsRepository } = useRepository();
	return useQuery({
		queryKey: oauthAppsRepository.getAppById$$key(appId),
		queryFn: () => oauthAppsRepository.getAppById(appId),
	});
};
