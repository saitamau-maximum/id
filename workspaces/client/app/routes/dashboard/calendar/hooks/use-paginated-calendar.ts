import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRepository } from "~/hooks/use-repository";

interface UsePaginatedCalendarParams {
	page: number;
	limit: number;
	fiscalYear?: number;
}

export function usePaginatedCalendar(params: UsePaginatedCalendarParams) {
	const { calendarRepository } = useRepository();
	
	const query = useQuery({
		queryKey: calendarRepository.getPaginatedEvents$$key(params),
		queryFn: () => calendarRepository.getPaginatedEvents(params),
		initialData: {
			events: [],
			total: 0,
			page: params.page,
			limit: params.limit,
			totalPages: 0,
		},
		keepPreviousData: true, // Keep previous data while loading new data
	});

	const generateICalUrl = useCallback(async () => {
		const url = await calendarRepository.generateURL();
		return url;
	}, [calendarRepository]);

	return {
		...query,
		generateICalUrl,
	};
}