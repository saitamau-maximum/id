import { useQuery } from "@tanstack/react-query";
import { useRepository } from "./useRepository";

export function useAuth() {
	const { authRepository } = useRepository();
	const { isLoading, data, refetch, error } = useQuery({
		queryKey: authRepository.me$$key(),
		queryFn: authRepository.me,
	});

	return {
		isLoading,
		user: data,
		isInitialized: !!data?.initialized,
		isAuthorized: !error,
		refetch,
	};
}
