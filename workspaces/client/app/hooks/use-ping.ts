import { useQuery } from "@tanstack/react-query";
import { PING_INTERVAL } from "~/utils/last-login";
import { useRepository } from "./use-repository";

export function usePing(enabled: boolean) {
	const { authRepository } = useRepository();
	return useQuery({
		queryKey: authRepository.ping$$key(),
		queryFn: () => authRepository.ping(),
		refetchInterval: PING_INTERVAL,
		refetchIntervalInBackground: true,
		enabled,
	});
}
