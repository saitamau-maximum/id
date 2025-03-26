import { useCallback } from "react";
import { Edit, Plus, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import { useLocations } from "~/routes/dashboard/calendar/hooks/use-locations";
import type { Location } from "~/types/location";
import { useCreateLocation } from "../hooks/use-create-location";
import { useDeleteLocation } from "../hooks/use-delete-location";
import { useUpdateLocation } from "../hooks/use-update-location";
import { CreateLocationDialog } from "./callable-create-location-dialog";
import { EditLocationDialog } from "./callable-edit-location-dialog";

export const LocationEditor = () => {
	const { locations } = useLocations();
	const { mutate: createLocation } = useCreateLocation();
	const sortedLocation = [...locations].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);

	const handleCreateLocation = useCallback(async () => {
		const res = await CreateLocationDialog.call();
		if (res.type === "dismiss") return;
		createLocation(res.payload);
	}, [createLocation]);

	return (
		<div>
			<div
				className={css({
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 6,
					marginBottom: 4,
				})}
			>
				<div
					className={css({
						display: "flex",
						gap: 2,
						alignItems: "center",
					})}
				>
					<h2
						className={css({
							fontSize: "xl",
							fontWeight: "bold",
							color: "gray.600",
						})}
					>
						活動場所一覧
					</h2>
				</div>
				<button type="button" onClick={handleCreateLocation}>
					<ButtonLike variant="primary" size="sm">
						<Plus size={16} />
						新規作成
					</ButtonLike>
				</button>
			</div>
			{locations.length === 0 ? (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
						marginTop: 8,
					})}
				>
					活動場所はありません
				</p>
			) : (
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th
								className={css({
									width: "100%",
								})}
							>
								タイトル
							</Table.Th>
							<Table.Th>操作</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{sortedLocation.map((location) => (
							<LocationTableRow location={location} key={location.id} />
						))}
					</tbody>
				</Table.Root>
			)}
		</div>
	);
};

interface LocationTableRowProps {
	location: Omit<Location, "description">;
}

const LocationTableRow = ({ location }: LocationTableRowProps) => {
	const { mutate: deleteLocation } = useDeleteLocation();
	const { mutate: updateLocation } = useUpdateLocation();

	const handleDeleteLocation = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "イベントの削除",
			children: <DeleteConfirmation title={location.name} />,
			danger: true,
		});
		if (res.type === "dismiss") return;
		deleteLocation(location);
	}, [location, deleteLocation]);

	const handleEditLocation = useCallback(async () => {
		const res = await EditLocationDialog.call({ locationId: location.id });
		if (res.type === "dismiss") return;
		updateLocation(res.payload);
	}, [location, updateLocation]);

	return (
		<Table.Tr>
			<Table.Td>
				<p>{location.name}</p>
			</Table.Td>
			<Table.Td>
				<div className={css({ display: "flex", gap: 2, width: "fit-content" })}>
					<IconButton label="編集" onClick={handleEditLocation}>
						<Edit size={16} />
					</IconButton>
					/
					<IconButton
						label="削除"
						color="danger"
						onClick={handleDeleteLocation}
					>
						<Trash size={16} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
