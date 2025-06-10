import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useDiscordInfo(userDisplayID: string | undefined) {
	const { memberRepository } = useRepository();
	return useQuery({
		queryKey: memberRepository.getDiscordInfoByUserDisplayID$$key(
			userDisplayID || "",
		),
		queryFn: () =>
			memberRepository.getDiscordInfoByUserDisplayID(userDisplayID || ""),
		enabled: !!userDisplayID,
	});
}
