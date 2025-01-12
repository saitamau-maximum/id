import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/useRepository";

export function useMembers() {
	const { memberRepository } = useRepository();
	return useQuery({
		queryKey: memberRepository.getMembers$$key(),
		queryFn: memberRepository.getMembers,
	});
}
