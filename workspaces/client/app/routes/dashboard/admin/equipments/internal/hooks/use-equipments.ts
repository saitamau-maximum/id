import { useQuery } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";

export const useEquipments = () => {
	const { equipmentRepository } = useRepository();
	return useQuery({
		queryKey: equipmentRepository.getAllEquipments$$key(),
		queryFn: equipmentRepository.getAllEquipments,
		initialData: [],
	});
};
