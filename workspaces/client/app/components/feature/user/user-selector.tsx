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
	multiple?: boolean;
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
	({ call, users, selectedUserIds: _selectedUserIds, multiple = true }) => {
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
				if (multiple) {
					// 複数選択モード
					if (selectedUserIds.includes(userId)) {
						setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
					} else {
						setSelectedUserIds((prev) => [...prev, userId]);
					}
				} else {
					// 単数選択モード
					if (selectedUserIds.includes(userId)) {
						setSelectedUserIds([]);
					} else {
						setSelectedUserIds([userId]);
					}
				}
			},
			[selectedUserIds, multiple],
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
						maxWidth: 800,
						width: "100%",
					})}
				>
					{multiple && (
						<p
							className={css({
								color: "gray.500",
								fontSize: "sm",
							})}
						>
							複数のユーザーを選択することができます
						</p>
					)}
					<Form.Field.TextInput
						label="ユーザー名"
						onChange={(e) => setFilter(e.target.value)}
						placeholder="ユーザー名で絞り込み"
					/>
					<div
						className={css({
							display: "grid",
							gap: 4,
							maxHeight: "30vh",
							overflowY: "auto",
						})}
					>
						<Form.SelectGroup>
							{unselectedFilterdUsers.map((user) => (
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
						{() =>
							selectedUsers.length > 0 ? (
								<div className={css({ maxHeight: "30vh", overflowY: "auto" })}>
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
								</div>
							) : (
								<p
									className={css({
										color: "gray.500",
										textAlign: "center",
										fontSize: "sm",
									})}
								>
									選択されているユーザーはいません
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
