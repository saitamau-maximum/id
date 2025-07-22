import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { EquipmentWithOwner } from "~/types/equipment";

export const useCreateEquipment = () => {
	const { equipmentRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: async (
			equipment: Omit<
				EquipmentWithOwner,
				"id" | "createdAt" | "updatedAt" | "owner"
			>,
		) => {
			await equipmentRepository.createEquipment({
				name: equipment.name,
				description: equipment.description ?? undefined,
				ownerId: equipment.ownerId,
			});
			return equipment;
		},
		onSuccess: (equipment) => {
			pushToast({
				title: `${equipment.name}を追加しました`,
				type: "success",
			});
			queryClient.invalidateQueries({
				queryKey: equipmentRepository.getAllEquipments$$key(),
			});
		},
		onError: () => {
			pushToast({
				title: "機器の追加に失敗しました",
				type: "error",
			});
		},
	});
};
