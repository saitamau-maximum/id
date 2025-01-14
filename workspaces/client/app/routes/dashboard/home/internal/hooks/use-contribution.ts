import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useContribution() {
	const { userRepository } = useRepository();
	return useQuery({
		queryKey: userRepository.getContributions$$key(),
		queryFn: userRepository.getContributions,
	});
}
