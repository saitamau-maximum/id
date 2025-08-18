import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRepository } from "~/hooks/use-repository";

export function usePaginatedCalendar(initialPage = 1, initialLimit = 10) {
	const { calendarRepository } = useRepository();
	const [page, setPage] = useState(initialPage);
	const [limit, setLimit] = useState(initialLimit);
	const [fiscalYear, setFiscalYear] = useState<number | undefined>();

	const query = useQuery({
		queryKey: calendarRepository.getPaginatedEvents$$key({
			page,
			limit,
			fiscalYear,
		}),
		queryFn: () =>
			calendarRepository.getPaginatedEvents({
				page,
				limit,
				fiscalYear,
			}),
	});

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const handleLimitChange = useCallback((newLimit: number) => {
		setLimit(newLimit);
		setPage(1); // Reset to first page when changing limit
	}, []);

	const handleFiscalYearChange = useCallback((newFiscalYear?: number) => {
		setFiscalYear(newFiscalYear);
		setPage(1); // Reset to first page when changing fiscal year
	}, []);

	return {
		...query,
		page,
		limit,
		fiscalYear,
		handlePageChange,
		handleLimitChange,
		handleFiscalYearChange,
	};
}