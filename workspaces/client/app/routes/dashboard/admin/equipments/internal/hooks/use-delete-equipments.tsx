import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { EquipmentWithOwner } from "~/types/equipment";

export const useDeleteEquipment = () => {
	const { equipmentRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: (equipment: EquipmentWithOwner) =>
			equipmentRepository.deleteEquipment(equipment.id),
		onSuccess: (_, equipment) => {
			pushToast({
				title: `${equipment.name}を削除しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: equipmentRepository.getAllEquipments$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "削除に失敗しました",
				type: "error",
			});
		},
	});
};
