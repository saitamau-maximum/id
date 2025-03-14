import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useCertificationRequests = () => {
	const { certificationRepository } = useRepository();
	return useQuery({
		queryKey: certificationRepository.getAllCertificationRequests$$key(),
		queryFn: certificationRepository.getAllCertificationRequests,
	});
};
