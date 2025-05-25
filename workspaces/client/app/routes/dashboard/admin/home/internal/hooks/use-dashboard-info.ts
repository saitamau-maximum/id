import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useDashboardInfo = () => {
	const { miscRepository } = useRepository();

	return useQuery({
		queryKey: miscRepository.getDashboardInfo$$key(),
		queryFn: miscRepository.getDashboardInfo,
	});
};
