import { useQuery } from "@tanstack/react-query";
import { AUTH_PING_INTERVAL } from "~/utils/auth-ping";
import { useRepository } from "./use-repository";

export function useAuthPing(enabled: boolean) {
	const { authRepository } = useRepository();
	return useQuery({
		queryKey: authRepository.ping$$key(),
		queryFn: () => authRepository.ping(),
		refetchInterval: AUTH_PING_INTERVAL,
		refetchIntervalInBackground: true,
		enabled,
	});
}
