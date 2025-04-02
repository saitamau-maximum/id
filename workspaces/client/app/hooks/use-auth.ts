import { useQuery } from "@tanstack/react-query";
import { useRepository } from "./use-repository";

// 今年度の最初の日付を取得する
const getFiscalYearStartDate = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return new Date(year, 3, 1);
	}
	return new Date(year - 1, 3, 1);
};

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
