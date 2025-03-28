import { useCallback, useMemo, useState } from "react";
import { createCallable } from "react-call";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ROLE_BY_ID, type RoleId } from "~/types/role";
import { RoleBadge } from "./role-badge";

interface Props {
	selectedRoleIds: RoleId[];
}

type Payload =
	| {
			type: "success";
			newSelectedRoleIds: RoleId[];
	  }
	| {
			type: "dismiss";
	  };

export const RoleSelector = createCallable<Props, Payload>(
	({ call, selectedRoleIds: _selectedRoleIds }) => {
		const [selectedRoleIds, setSelectedRoleIds] = useState(_selectedRoleIds);

		const unselectedRoles = useMemo(() => {
			return Object.values(ROLE_BY_ID).filter(
				(role) => !selectedRoleIds.includes(role.id as RoleId),
			);
		}, [selectedRoleIds]);

		const selectedRoles = useMemo(() => {
			return Object.values(ROLE_BY_ID).filter((role) =>
				selectedRoleIds.includes(role.id as RoleId),
			);
		}, [selectedRoleIds]);

		const handleUpdate = useCallback(() => {
			call.end({ type: "success", newSelectedRoleIds: selectedRoleIds });
		}, [call, selectedRoleIds]);

		const onToggleRole = useCallback(
			(roleId: RoleId) => {
				if (selectedRoleIds.includes(roleId)) {
					setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
				} else {
					setSelectedRoleIds((prev) => [...prev, roleId]);
				}
			},
			[selectedRoleIds],
		);

		return (
			<Dialog
				title="ロール選択"
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end({ type: "dismiss" });
				}}
			>
				<div
					className={css({
						display: "grid",
						gap: 4,
						maxWidth: 800,
						width: "100%",
					})}
				>
					<div
						className={css({
							display: "grid",
							gap: 4,
							maxHeight: "30vh",
							overflowY: "auto",
						})}
					>
						<Form.SelectGroup>
							{unselectedRoles.map((role) => (
								<Form.Select
									key={role.id}
									value={role.id}
									label={role.name}
									onChange={() => onToggleRole(role.id as RoleId)}
									checked={selectedRoleIds.includes(role.id as RoleId)}
								>
									<RoleBadge role={role} />
								</Form.Select>
							))}
						</Form.SelectGroup>
					</div>
					<Form.Field.WithLabel label="選択済みロール">
						{() =>
							selectedRoles.length > 0 ? (
								<div className={css({ maxHeight: "30vh", overflowY: "auto" })}>
									<Form.SelectGroup>
										{selectedRoles.map((role) => (
											<Form.Select
												key={role.id}
												value={role.id}
												label={role.name}
												onChange={() => onToggleRole(role.id as RoleId)}
												checked={selectedRoleIds.includes(role.id as RoleId)}
											>
												<RoleBadge role={role} />
											</Form.Select>
										))}
									</Form.SelectGroup>
								</div>
							) : (
								<p
									className={css({
										color: "gray.500",
										textAlign: "center",
										fontSize: "sm",
									})}
								>
									選択されているロールはありません
								</p>
							)
						}
					</Form.Field.WithLabel>
					<div
						className={css({
							display: "flex",
							justifyContent: "center",
							gap: 4,
							gridColumn: "1 / -1",
						})}
					>
						<button type="button" onClick={() => call.end({ type: "dismiss" })}>
							<ButtonLike variant="secondary">キャンセル</ButtonLike>
						</button>
						<button type="button" onClick={handleUpdate}>
							<ButtonLike>更新</ButtonLike>
						</button>
					</div>
				</div>
			</Dialog>
		);
	},
);
