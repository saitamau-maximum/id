import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useMemberContribution(userDisplayId: string) {
	const { memberRepository } = useRepository();
	return useQuery({
		queryKey:
			memberRepository.getContributionsByUserDisplayID$$key(userDisplayId),
		queryFn: () =>
			memberRepository.getContributionsByUserDisplayID(userDisplayId),
	});
}
