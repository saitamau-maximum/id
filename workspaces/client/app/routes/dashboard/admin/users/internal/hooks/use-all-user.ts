import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useAllUsers = () => {
	const { userRepository } = useRepository();
	return useQuery({
		queryKey: userRepository.getAllUsers$$key(),
		queryFn: userRepository.getAllUsers,
		initialData: [],
	});
};
