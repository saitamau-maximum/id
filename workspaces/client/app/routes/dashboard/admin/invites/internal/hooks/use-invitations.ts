import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useInvitations = () => {
	const { invitationRepository } = useRepository();
	return useQuery({
		queryKey: invitationRepository.getInvitations$$key(),
		queryFn: invitationRepository.getInvitations,
		initialData: [],
	});
};
