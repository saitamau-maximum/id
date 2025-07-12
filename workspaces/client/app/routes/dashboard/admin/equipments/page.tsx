import { css } from "styled-system/css";
import { EquipmentDialog } from "./internal/components/callable-equipment-dialog";
import { EquipmentEditor } from "./internal/components/equipments-editor";

export default function EquipmentsPage() {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 8,
			})}
		>
			<div>
				<EquipmentEditor />
				<EquipmentDialog.Root />
			</div>
		</div>
	);
}
