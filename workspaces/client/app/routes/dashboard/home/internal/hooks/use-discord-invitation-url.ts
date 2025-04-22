import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useDiscordInvitationURL() {
	const { miscRepository } = useRepository();
	return useQuery({
		queryKey: miscRepository.getDiscordInvitationURL$$key(),
		queryFn: miscRepository.getDiscordInvitationURL,
	});
}
