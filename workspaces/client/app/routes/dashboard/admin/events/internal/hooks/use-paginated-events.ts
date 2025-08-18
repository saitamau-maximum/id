import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "~/repository/calendar";
import { useRepository } from "~/hooks/use-repository";

export const usePaginatedEvents = (params: PaginationParams) => {
	const { CalendarRepository } = useRepository();
	
	return useQuery({
		queryKey: CalendarRepository.getPaginatedEvents$$key(params),
		queryFn: () => CalendarRepository.getPaginatedEvents(params),
	});
};