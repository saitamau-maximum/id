import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "~/hooks/use-repository";
import { useToast } from "~/hooks/use-toast";
import type { EquipmentCreateParams } from "~/repository/equipment";

export const useCreateEquipment = () => {
	const { equipmentRepository } = useRepository();
	const queryClient = useQueryClient();
	const { pushToast } = useToast();
	return useMutation({
		mutationFn: (equipment: EquipmentCreateParams) =>
			equipmentRepository.createEquipment(equipment),
		onSuccess: (_, equipment) => {
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
				title: "備品の追加に失敗しました",
				type: "error",
			});
		},
	});
};
