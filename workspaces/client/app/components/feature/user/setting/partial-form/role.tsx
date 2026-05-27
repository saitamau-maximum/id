import { ROLE_BY_ID, ROLE_IDS, type RoleId } from "@idp/schema/entity/role";
import { useCallback, useEffect, useState } from "react";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { RoleBadge } from "../../role-badge";
import { useUpdateRole } from "../hooks/use-update-role";

export const UserSettingFormRole = () => {
	const { user, isLoading } = useAuth();
	const { mutate: updateRole, isPending } = useUpdateRole();

	const [selectedRoleIds, setSelectedRoleIds] = useState<RoleId[]>([]);

	useEffect(() => {
		if (!isLoading && user)
			setSelectedRoleIds(user.roles.map((role) => role.id));
	}, [isLoading, user]);

	const onToggleRole = useCallback(
		(roleId: RoleId) => {
			// 呼ばれないはずだが、念のため self-assignable なロール以外は無視する
			if (!ROLE_BY_ID[roleId].selfAssignable) return;

			if (selectedRoleIds.includes(roleId)) {
				setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
			} else {
				setSelectedRoleIds((prev) => [...prev, roleId]);
			}
		},
		[selectedRoleIds],
	);

	const canSubmit = !isLoading && !isPending;

	const onSubmit = useCallback(() => {
		if (!canSubmit) return;
		const selfAssignableSelectedRoleIds = selectedRoleIds.filter(
			(roleId) => ROLE_BY_ID[roleId].selfAssignable,
		);
		updateRole(selfAssignableSelectedRoleIds);
	}, [selectedRoleIds, updateRole, canSubmit]);

	return (
		<>
			<p
				className={css({ color: "gray.600", textAlign: "left", width: "100%" })}
			>
				活動班などの以下のロールについては、自分で付けたり外したりすることができます。
				ロールを変更すると、 GitHub や Discord
				などの外部サービスでのロールも自動で変更されます。
				ただし、反映されるまでに最大 1 日程度かかることがあります。
			</p>

			{isLoading ? (
				<div
					className={css({
						width: "100%",
						height: "sm",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						animation: "pulse",
						backgroundColor: "gray.100",
						borderRadius: "md",
					})}
				>
					<p
						className={css({
							color: "gray.600",
						})}
					>
						Loading...
					</p>
				</div>
			) : (
				<Form.SelectGroup>
					{Object.values(ROLE_IDS).map((roleId) => {
						// self-assignable なロールだけ表示する
						const role = ROLE_BY_ID[roleId];
						if (!role.selfAssignable) return null;

						return (
							<Form.Select
								key={roleId}
								label={role.name}
								value={roleId}
								onChange={() => onToggleRole(roleId)}
								checked={selectedRoleIds.includes(roleId)}
							>
								<RoleBadge role={role} variant="large" />
							</Form.Select>
						);
					})}
				</Form.SelectGroup>
			)}

			<p
				className={css({ color: "gray.600", textAlign: "left", width: "100%" })}
			>
				以下のロールは Admin のみが付け外しできます。 必要なら Admin
				に相談してください。
			</p>

			{isLoading ? (
				<div
					className={css({
						width: "100%",
						height: "sm",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						animation: "pulse",
						backgroundColor: "gray.100",
						borderRadius: "md",
					})}
				>
					<p
						className={css({
							color: "gray.600",
						})}
					>
						Loading...
					</p>
				</div>
			) : (
				<Form.SelectGroup>
					{Object.values(ROLE_IDS).map((roleId) => {
						// self-assignable でないロールだけ表示する
						const role = ROLE_BY_ID[roleId];
						if (role.selfAssignable) return null;

						return (
							<Form.Select
								key={roleId}
								label={role.name}
								value={roleId}
								checked={selectedRoleIds.includes(roleId)}
								disabled
							>
								<RoleBadge role={role} variant="large" />
							</Form.Select>
						);
					})}
				</Form.SelectGroup>
			)}

			<button type="button" onClick={onSubmit} disabled={!canSubmit}>
				<ButtonLike variant="primary" disabled={!canSubmit}>
					更新
				</ButtonLike>
			</button>
		</>
	);
};
