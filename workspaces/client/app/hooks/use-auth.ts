import { useQuery } from "@tanstack/react-query";
import { ROLE_IDS } from "~/types/role";
import { getFiscalYearStartDate } from "~/utils/date";
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
		isInitialized: !!data?.initializedAt,
		isAuthorized: !error,
		isProvisional: !!data?.isProvisional,
		isMember: data?.roles.some((role) => role.id === ROLE_IDS.MEMBER) || false,
		// 今年度の最初の日付以降に更新されたか
		hasFiscalYearUpdated:
			data?.updatedAt && data.updatedAt >= getFiscalYearStartDate(),
		refetch,
		// 今年度の会費を払ったことを確認したか
		isFiscalYearPaid:
			data?.lastPaymentConfirmedAt &&
			data?.lastPaymentConfirmedAt >= getFiscalYearStartDate(),
	};
}
