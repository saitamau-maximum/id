import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useLocations() {
	const { locationRepository } = useRepository();
	return useQuery({
		queryKey: locationRepository.getAllLocations$$key(),
		queryFn: locationRepository.getAllLocations,
		initialData: [],
	});
}
