import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useProvisionalUsers = () => {
	const { userRepository } = useRepository();
	return useQuery({
		queryKey: userRepository.getAllProvisionalUsers$$key(),
		queryFn: userRepository.getAllProvisionalUsers,
		initialData: [],
	});
};
