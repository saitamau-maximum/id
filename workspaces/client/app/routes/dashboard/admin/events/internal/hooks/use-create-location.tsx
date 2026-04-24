import type { CalendarLocationCreateParams } from "@idp/schema/api/calendar/location";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useCreateLocation = () => {
	const { locationRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (location: CalendarLocationCreateParams) => {
			await locationRepository.createLocation(location);
			return location;
		},
		onSuccess: (location) => {
			pushToast({
				title: `活動場所「${location.name}」を作成しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: locationRepository.getAllLocations$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "活動場所の作成に失敗しました",
				type: "error",
			});
		},
	});
};
