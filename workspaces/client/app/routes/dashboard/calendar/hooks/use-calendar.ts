import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useCalendar() {
	const { calendarRepository } = useRepository();
	return useQuery({
		queryKey: calendarRepository.getAllEvents$$key(),
		queryFn: calendarRepository.getAllEvents,
		initialData: [],
	});
}
