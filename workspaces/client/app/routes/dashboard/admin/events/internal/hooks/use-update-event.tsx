import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CalendarEventWithNotify } from "~/types/event";

export const useUpdateEvent = () => {
	const { calendarRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (event: CalendarEventWithNotify) => {
			await calendarRepository.updateEvent(event);
			return event;
		},
		onSuccess: (event) => {
			pushToast({
				title: `イベント「${event.title}」を更新しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: calendarRepository.getAllEvents$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "イベントの更新に失敗しました",
				type: "error",
			});
		},
	});
};
