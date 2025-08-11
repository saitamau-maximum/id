import { valibotResolver } from "@hookform/resolvers/valibot";
import { useCallback } from "react";
import { createCallable } from "react-call";
import { Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { UserDisplay } from "~/components/feature/user/user-display";
import { UserSelector } from "~/components/feature/user/user-selector";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { useAllUsers } from "~/routes/dashboard/admin/users/internal/hooks/use-all-user";
import { ConfigSectionSubHeader } from "~/routes/dashboard/oauth-apps/config/internal/components/config-section-sub-header";
import { EquipmentSchemas } from "~/schema/equipment";
import type { Equipment, EquipmentWithOwner } from "~/types/equipment";

type Payload =
	| {
			type: "success";
			payload: Omit<Equipment, "id" | "createdAt" | "updatedAt">;
	  }
	| {
			type: "dismiss";
	  };

type DialogProps = {
	equipment?: EquipmentWithOwner | null;
};

const CreateEquipmentSchema = v.object({
	name: EquipmentSchemas.Name,
	description: EquipmentSchemas.Description,
	ownerId: EquipmentSchemas.OwnerId,
});

type CreateFormInputValues = v.InferInput<typeof CreateEquipmentSchema>;
type CreateFormOutputValues = v.InferOutput<typeof CreateEquipmentSchema>;

export const EquipmentDialog = createCallable<DialogProps, Payload>(
	({ call, equipment }) => {
		const { data: users } = useAllUsers();
		const isEditing = !!equipment;

		const {
			handleSubmit,
			register,
			formState: { errors },
			setValue,
			watch,
		} = useForm<CreateFormInputValues, unknown, CreateFormOutputValues>({
			resolver: valibotResolver(CreateEquipmentSchema),
			defaultValues: {
				name: equipment?.name || "",
				description: equipment?.description || "",
				ownerId: equipment?.ownerId || "",
			},
		});

		const onSubmit = async (values: CreateFormOutputValues) => {
			call.end({
				type: "success",
				payload: {
					...values,
				},
			});
		};

		const currentOwnerId = watch("ownerId");
		const currentOwner = users?.find((user) => user.id === currentOwnerId);

		const handleAddOwner = useCallback(async () => {
			if (!users) return;
			const res = await UserSelector.call({
				users,
				selectedUserIds: currentOwnerId ? [currentOwnerId] : [],
				multiple: false,
			});
			if (res.type === "dismiss") return;

			const selectedUserId = res.newSelectedUserIds[0] || "";
			setValue("ownerId", selectedUserId);
		}, [users, currentOwnerId, setValue]);

		const handleRemoveOwner = useCallback(() => {
			setValue("ownerId", "");
		}, [setValue]);

		return (
			<Dialog
				title={isEditing ? "備品情報の編集" : "備品情報の作成"}
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end({ type: "dismiss" });
				}}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className={css({
						display: "grid",
						gap: 4,
						gridTemplateColumns: "1fr",
					})}
				>
					<Form.Field.TextInput
						label="備品名"
						required
						error={errors.name?.message}
						{...register("name")}
					/>

					<div
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: 2,
						})}
					>
						<ConfigSectionSubHeader title="所有者">
							<IconButton type="button" onClick={handleAddOwner} label="Add">
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
							{currentOwner ? (
								<div
									className={css({
										display: "flex",
										alignItems: "center",
										gap: 2,
									})}
								>
									<UserDisplay
										displayId={currentOwner.displayId ?? ""}
										name={`${currentOwner.displayName} (@${currentOwner.displayId})`}
										iconURL={currentOwner.profileImageURL ?? ""}
										link
									/>
									<IconButton
										type="button"
										onClick={handleRemoveOwner}
										label="Remove owner"
									>
										<X size={16} />
									</IconButton>
								</div>
							) : (
								<p
									className={css({
										color: "gray.500",
										marginTop: "token(spacing.1)",
										textAlign: "center",
										width: "100%",
									})}
								>
									所有者が選択されていません
								</p>
							)}
						</div>
						{errors.ownerId && (
							<span
								className={css({
									fontSize: "sm",
									color: "rose.500",
								})}
							>
								{errors.ownerId.message}
							</span>
						)}
					</div>

					<Form.Field.TextArea
						label="説明"
						{...register("description")}
						error={errors.description?.message}
						placeholder="備品の説明を入力してください"
					/>

					<div
						className={css({
							display: "flex",
							justifyContent: "center",
							gap: 4,
							gridColumn: "1 / -1",
							marginTop: 4,
						})}
					>
						<button type="button" onClick={() => call.end({ type: "dismiss" })}>
							<ButtonLike variant="secondary">キャンセル</ButtonLike>
						</button>
						<button type="submit">
							<ButtonLike variant="primary">
								{isEditing ? "更新" : "作成"}
							</ButtonLike>
						</button>
					</div>
				</form>
			</Dialog>
		);
	},
);
