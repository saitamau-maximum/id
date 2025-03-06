import { useCallback, useMemo, useState } from "react";
import { createCallable } from "react-call";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import type { UserBasicInfo } from "~/types/user";
import { UserDisplay } from "./user-display";

interface Props {
	users: UserBasicInfo[];
	selectedUserIds: string[];
}

type Payload =
	| {
			type: "success";
			newSelectedUserIds: string[];
	  }
	| {
			type: "dismiss";
	  };

export const UserSelector = createCallable<Props, Payload>(
	({ call, users, selectedUserIds: _selectedUserIds }) => {
		const [filter, setFilter] = useState("");
		const [selectedUserIds, setSelectedUserIds] = useState(_selectedUserIds);

		const unselectedFilterdUsers = useMemo(() => {
			const unselectedUsers = users.filter(
				(user) => !selectedUserIds.includes(user.id),
			);
			if (!filter) return unselectedUsers;

			return unselectedUsers.filter((user) =>
				user.displayName?.toLowerCase().includes(filter.toLowerCase()),
			);
		}, [filter, users, selectedUserIds]);

		const selectedUsers = useMemo(
			() => users.filter((user) => selectedUserIds.includes(user.id)),
			[users, selectedUserIds],
		);

		const handleUpdate = useCallback(() => {
			call.end({ type: "success", newSelectedUserIds: selectedUserIds });
		}, [call, selectedUserIds]);

		const onToggleUser = useCallback(
			(userId: string) => {
				if (selectedUserIds.includes(userId)) {
					setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
				} else {
					setSelectedUserIds((prev) => [...prev, userId]);
				}
			},
			[selectedUserIds],
		);

		return (
			<Dialog
				title="ユーザー選択"
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
					})}
				>
					<Form.Field.TextInput
						label="ユーザー名"
						onChange={(e) => setFilter(e.target.value)}
						placeholder="ユーザー名で絞り込み"
					/>
					<div className={css({ display: "grid", gap: 4 })}>
						<Form.SelectGroup>
							{unselectedFilterdUsers.map((user, i) => (
								<Form.Select
									key={user.id}
									value={user.id}
									label={user.displayName ?? ""}
									onChange={() => onToggleUser(user.id)}
									checked={selectedUserIds.includes(user.id)}
								>
									<UserDisplay
										name={user.displayName ?? ""}
										displayId={user.displayId ?? ""}
										iconURL={user.profileImageURL ?? ""}
									/>
								</Form.Select>
							))}
						</Form.SelectGroup>
					</div>
					<Form.Field.WithLabel label="選択済みユーザー">
						{() => (
							<Form.SelectGroup>
								{selectedUsers.map((user) => (
									<Form.Select
										key={user.id}
										value={user.id}
										label={user.displayName ?? ""}
										onChange={() => onToggleUser(user.id)}
										checked={selectedUserIds.includes(user.id)}
									>
										<UserDisplay
											name={user.displayName ?? ""}
											displayId={user.displayId ?? ""}
											iconURL={user.profileImageURL ?? ""}
										/>
									</Form.Select>
								))}
							</Form.SelectGroup>
						)}
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
