import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useRepository } from "~/hooks/use-repository";

export function useLocations() {
	const { locationRepository } = useRepository();
	const { data: locations } = useQuery({
		queryKey: locationRepository.getAllLocations$$key(),
		queryFn: locationRepository.getAllLocations,
		initialData: [],
	});

	const locationMap = useMemo(() => {
		return new Map(locations.map((location) => [location.id, location]));
	}, [locations]);

	return { locations, locationMap };
}
