import type { MetaFunction } from "react-router";
import { css } from "styled-system/css";
import { EquipmentDialog } from "./internal/components/callable-equipment-dialog";
import { EquipmentEditor } from "./internal/components/equipments-editor";

export const meta: MetaFunction = () => {
	return [{ title: "備品管理 | Maximum IdP" }];
};
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
