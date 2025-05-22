import { useQuery } from "@tanstack/react-query";
import { useRepository } from "./use-repository";

export function usePing(enabled: boolean) {
	const { authRepository } = useRepository();
	return useQuery({
		queryKey: authRepository.ping$$key(),
		queryFn: () => authRepository.ping(),
		refetchInterval: 30000,
		refetchIntervalInBackground: true,
		enabled,
	});
}
