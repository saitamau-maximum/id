import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useDiscordInfo(userDisplayID: string | undefined) {
	const { discordRepository } = useRepository();
	return useQuery({
		queryKey: discordRepository.getDiscordInfoByUserDisplayID$$key(
			userDisplayID || "",
		),
		queryFn: () =>
			discordRepository.getDiscordInfoByUserDisplayID(userDisplayID || ""),
		enabled: !!userDisplayID,
	});
}
