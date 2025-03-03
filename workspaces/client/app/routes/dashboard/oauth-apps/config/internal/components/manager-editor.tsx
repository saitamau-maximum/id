import { useCallback, useMemo } from "react";
import { Plus } from "react-feather";
import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { UserSelector } from "~/components/feature/user/user-selector";
import { IconButton } from "~/components/ui/icon-button";
import { useMembers } from "~/routes/dashboard/members/internal/hooks/use-members";
import type { UserBasicInfo } from "~/types/user";
import { useUpdateManagers } from "../hooks/use-update-managers";
import { ConfigSectionSubHeader } from "./config-section-sub-header";

interface Props {
	id: string;
	ownerId: string;
	managers: UserBasicInfo[];
}

export const ManagerEditor = ({ id, ownerId, managers }: Props) => {
	const { mutate: updateManagers } = useUpdateManagers({ id });
	const { data: members } = useMembers();

	// owner以外のmanager
	const optionalManagers = useMemo(() => {
		return managers.filter((manager) => manager.id !== ownerId);
	}, [managers, ownerId]);

	const handleAddManager = useCallback(async () => {
		if (!members) return;

		const res = await UserSelector.call({
			users: members.filter((member) => member.id !== ownerId),
			selectedUserIds: optionalManagers.map((manager) => manager.id),
		});

		if (res.type === "dismiss") return;

		updateManagers({
			managerUserIds: [ownerId, ...res.newSelectedUserIds],
		});
	}, [optionalManagers, members, ownerId, updateManagers]);

	return (
		<>
			<ConfigSectionSubHeader title="Managers">
				<IconButton type="button" onClick={handleAddManager} label="Add">
					<Plus size={16} />
				</IconButton>
			</ConfigSectionSubHeader>
			<div
				className={css({
					display: "flex",
					flexWrap: "wrap",
					gap: "token(spacing.1) token(spacing.4)",
				})}
			>
				{optionalManagers.length > 0 ? (
					optionalManagers.map((manager) => (
						<div
							key={manager.id}
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 2,
							})}
						>
							<UserDisplay
								displayId={manager.displayId ?? ""}
								name={`${manager.displayName} (@${manager.displayId})`}
								iconURL={manager.profileImageURL ?? ""}
								link
							/>
						</div>
					))
				) : (
					<p
						className={css({
							color: "gray.500",
							marginTop: "token(spacing.1)",
							textAlign: "center",
							width: "100%",
						})}
					>
						No managers
					</p>
				)}
			</div>
		</>
	);
};
