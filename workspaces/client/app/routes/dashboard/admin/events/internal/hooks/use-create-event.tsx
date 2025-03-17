import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { CalendarEvent } from "~/types/event";

export const useCreateEvent = () => {
	const { calendarRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (event: Omit<CalendarEvent, "id" | "userId">) => {
			await calendarRepository.createEvent(event);
			return event;
		},
		onSuccess: (event) => {
			pushToast({
				title: `イベント ${event.title} を作成しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: calendarRepository.getAllEvents$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "イベントの作成に失敗しました",
				type: "error",
			});
		},
	});
};
