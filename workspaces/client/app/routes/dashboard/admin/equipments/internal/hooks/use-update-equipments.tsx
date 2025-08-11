import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { EquipmentWithOwner } from "~/types/equipment";

export const useUpdateEquipment = () => {
	const { equipmentRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (equipment: EquipmentWithOwner) => {
			await equipmentRepository.updateEquipment({
				id: equipment.id,
				name: equipment.name,
				description: equipment.description ?? undefined,
				ownerId: equipment.ownerId,
				updatedAt: equipment.updatedAt,
			});
			return equipment;
		},
		onSuccess: (equipment) => {
			pushToast({
				title: `${equipment.name}を更新しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: equipmentRepository.getAllEquipments$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "更新に失敗しました",
				type: "error",
			});
		},
	});
};
