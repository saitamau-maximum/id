import { useCallback } from "react";
import { Edit, Plus, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { EquipmentWithOwner } from "~/types/equipment";
import { formatDateTime } from "~/utils/date";
import { useCreateEquipment } from "../hooks/use-create-equipments";
import { useDeleteEquipment } from "../hooks/use-delete-equipments";
import { useEquipments } from "../hooks/use-equipments";
import { useUpdateEquipment } from "../hooks/use-update-equipments";
import { EquipmentDialog } from "./callable-equipment-dialog";

export const EquipmentEditor = () => {
	const { data: equipments } = useEquipments();
	const { mutate: createEquipment } = useCreateEquipment();
	const { mutate: updateEquipment } = useUpdateEquipment();
	const { mutate: deleteEquipment } = useDeleteEquipment();

	const handleCreateEquipment = useCallback(async () => {
		const res = await EquipmentDialog.call({});
		if (res.type === "dismiss") return;
		createEquipment(res.payload);
	}, [createEquipment]);

	const handleEditEquipment = useCallback(
		async (equipment: EquipmentWithOwner) => {
			const res = await EquipmentDialog.call({ equipment });
			if (res.type === "dismiss") return;
			updateEquipment({
				...equipment,
				...res.payload,
			});
		},
		[updateEquipment],
	);

	const handleDeleteEquipment = useCallback(
		async (equipment: EquipmentWithOwner) => {
			const res = await ConfirmDialog.call({
				title: "備品の削除",
				children: <DeleteConfirmation title={equipment.name} />,
				danger: true,
			});
			if (res.type === "dismiss") return;
			deleteEquipment(equipment);
		},
		[deleteEquipment],
	);

	return (
		<div>
			<div
				className={css({
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 4,
				})}
			>
				<h2
					className={css({
						fontSize: "xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					備品一覧
				</h2>
				<button type="button" onClick={handleCreateEquipment}>
					<ButtonLike variant="primary" size="sm">
						<Plus size={16} />
						備品を追加
					</ButtonLike>
				</button>
			</div>
			{equipments && equipments.length > 0 ? (
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th>備品名</Table.Th>
							<Table.Th>説明</Table.Th>
							<Table.Th>作成日</Table.Th>
							<Table.Th>最終更新</Table.Th>
							<Table.Th>所有者</Table.Th>
							<Table.Th>操作</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{equipments.map((equipment) => (
							<Table.Tr key={equipment.id}>
								<Table.Td>
									<span className={css({ fontWeight: "semibold" })}>
										{equipment.name}
									</span>
								</Table.Td>
								<Table.Td>
									{equipment.description !== null && (
										<span
											className={css({
												color: "gray.600",
												textOverflow: "ellipsis",
											})}
										>
											{equipment.description.length > 50
												? `${equipment.description.slice(0, 50)}...`
												: equipment.description}
										</span>
									)}
								</Table.Td>
								<Table.Td>{formatDateTime(equipment.createdAt)}</Table.Td>
								<Table.Td>{formatDateTime(equipment.updatedAt)}</Table.Td>
								<Table.Td>
									<UserDisplay
										iconURL={equipment.owner.profileImageURL}
										name={equipment.owner.displayName || ""}
										displayId={equipment.owner.displayId || ""}
										link
									/>
								</Table.Td>
								<Table.Td>
									<div
										className={css({
											display: "flex",
											gap: 2,
											width: "fit-content",
										})}
									>
										<IconButton
											label="編集"
											onClick={() => handleEditEquipment(equipment)}
										>
											<Edit size={16} />
										</IconButton>
										/
										<IconButton
											label="削除"
											color="danger"
											onClick={() => handleDeleteEquipment(equipment)}
										>
											<Trash size={16} />
										</IconButton>
									</div>
								</Table.Td>
							</Table.Tr>
						))}
					</tbody>
				</Table.Root>
			) : (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
						marginTop: 4,
						marginBottom: 4,
					})}
				>
					備品がありません
				</p>
			)}
		</div>
	);
};
