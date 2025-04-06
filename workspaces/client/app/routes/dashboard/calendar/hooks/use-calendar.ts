import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRepository } from "~/hooks/use-repository";

export function useCalendar() {
	const { calendarRepository } = useRepository();
	const query = useQuery({
		queryKey: calendarRepository.getAllEvents$$key(),
		queryFn: calendarRepository.getAllEvents,
		initialData: [],
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
