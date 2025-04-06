import { useQuery } from "@tanstack/react-query";
import { getFiscalYearStartDate } from "~/utils/fiscal-year";
import { useRepository } from "./use-repository";

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
		// 今年度の最初の日付以降に更新されたか
		hasFiscalYearUpdated:
			data?.updatedAt && data.updatedAt >= getFiscalYearStartDate(),
		refetch,
	};
}
