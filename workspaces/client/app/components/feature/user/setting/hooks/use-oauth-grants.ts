import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useOAuthGrants = () => {
	const { userRepository } = useRepository();

	return useQuery({
		queryKey: userRepository.getOAuthGrants$$key(),
		queryFn: () => userRepository.getOAuthGrants(),
		initialData: [],
	});
};
