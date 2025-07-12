import { valibotResolver } from "@hookform/resolvers/valibot";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { useAllUsers } from "~/routes/dashboard/admin/users/internal/hooks/use-all-user";
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
						<label
							htmlFor="equipment-owner"
							className={css({
								fontSize: "sm",
								fontWeight: "medium",
								color: "gray.700",
							})}
						>
							所有者 *
						</label>
						<select
							id="equipment-owner"
							className={css({
								display: "block",
								width: "100%",
								padding: "0.5rem",
								borderRadius: "0.375rem",
								borderWidth: 1,
								borderStyle: "solid",
								borderColor: errors.ownerId ? "red.300" : "gray.300",
								backgroundColor: "white",
								"&:focus": {
									outline: "none",
									borderColor: "blue.500",
									boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
								},
							})}
							{...register("ownerId")}
						>
							<option value="">所有者を選択してください</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.displayName || user.email || user.id}
								</option>
							))}
						</select>
						{errors.ownerId && (
							<span
								className={css({
									fontSize: "sm",
									color: "red.600",
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
