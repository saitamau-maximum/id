import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useMemberProfile(userDisplayId: string) {
	const { memberRepository } = useRepository();
	return useQuery({
		queryKey: memberRepository.getProfileByUserDisplayID$$key(userDisplayId),
		queryFn: () => memberRepository.getProfileByUserDisplayID(userDisplayId),
	});
}
