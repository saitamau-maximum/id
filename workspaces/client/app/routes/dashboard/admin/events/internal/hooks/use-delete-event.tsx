import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CalendarEvent } from "~/types/event";

export const useDeleteEvent = () => {
	const { calendarRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (event: CalendarEvent) => {
			await calendarRepository.deleteEvent(event.id);
			return event;
		},
		onSuccess: (event) => {
			pushToast({
				title: `イベント「${event.title}」を削除しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: calendarRepository.getAllEvents$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "イベントの削除に失敗しました",
				type: "error",
			});
		},
	});
};
