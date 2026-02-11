import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export function useMemberContribution(userDisplayId?: string) {
	const { memberRepository } = useRepository();
	return useQuery({
		enabled: userDisplayId !== undefined,
		queryKey: memberRepository.getContributionsByUserDisplayID$$key(
			userDisplayId ?? "",
		),
		queryFn: () => {
			// undefined の場合は実行されないはずだが型安全のためにチェック
			if (!userDisplayId) throw new Error("userDisplayId is required");
			return memberRepository.getContributionsByUserDisplayID(userDisplayId);
		},
	});
}
