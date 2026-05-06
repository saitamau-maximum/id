import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useCertifications = () => {
	const { certificationRepository } = useRepository();
	return useQuery({
		queryKey: certificationRepository.getAllCertifications$$key(),
		queryFn: certificationRepository.getAllCertifications,
	});
};
