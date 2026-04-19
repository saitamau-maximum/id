import type { EquipmentWithOwner } from "@idp/schema/entity/equipment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";

export const useUpdateEquipment = () => {
	const { equipmentRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: (equipment: EquipmentWithOwner) =>
			equipmentRepository.updateEquipment(equipment.id, {
				name: equipment.name,
				description: equipment.description,
				ownerId: equipment.ownerId,
			}),
		onSuccess: (_, equipment) => {
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
