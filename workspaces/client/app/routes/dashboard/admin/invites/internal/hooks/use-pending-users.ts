import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const usePendingUsers = () => {
	const { userRepository } = useRepository();
	return useQuery({
		queryKey: userRepository.getAllPendingUsers$$key(),
		queryFn: userRepository.getAllPendingUsers,
		initialData: [],
	});
};
