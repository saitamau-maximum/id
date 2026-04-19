import type { CalendarLocationGetLocationsResponse } from "@idp/schema/api/calendar/location";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useDeleteLocation = () => {
	const { locationRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (
			location: CalendarLocationGetLocationsResponse[number],
		) => {
			await locationRepository.deleteLocation(location.id);
			return location;
		},
		onSuccess: (location) => {
			pushToast({
				title: `活動場所「${location.name}」を削除しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: locationRepository.getAllLocations$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "活動場所の削除に失敗しました",
				type: "error",
			});
		},
	});
};
