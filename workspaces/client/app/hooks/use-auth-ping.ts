import { useQuery } from "@tanstack/react-query";
import { AUTH_PING_INTERVAL } from "~/utils/auth-ping";
import { useRepository } from "./use-repository";

export function useAuthPing(enabled: boolean) {
	const { authRepository } = useRepository();
	return useQuery({
		queryKey: authRepository.ping$$key(),
		// Query data cannot be undefined らしいので適当な文字列を返す
		queryFn: () => authRepository.ping().then(() => "ok"),
		refetchInterval: AUTH_PING_INTERVAL,
		refetchIntervalInBackground: true,
		enabled,
	});
}
