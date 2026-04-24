import type { Event } from "@idp/schema/entity/calendar/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useDeleteEvent = () => {
	const { calendarRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (event: Event) => {
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
