import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import type { Location } from "~/types/location";

interface Props {
	locationId: Location["id"];
}

export function useLocationDetail({ locationId }: Props) {
	const { locationRepository } = useRepository();

	return useQuery({
		queryKey: locationRepository.getLocationById$$key(locationId),
		queryFn: () => locationRepository.getLocationById(locationId),
	});
}
