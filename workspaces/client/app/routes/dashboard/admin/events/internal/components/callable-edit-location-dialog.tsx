import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect, useState } from "react";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { useMarkdown } from "~/hooks/use-markdown";
import { useLocationDetail } from "~/routes/dashboard/calendar/hooks/use-location-detail";
import { LOCATION_DESCRIPTION_MAX_LINES } from "~/schema/location";
import { LocationSchemas } from "~/schema/location";
import type { Location } from "~/types/location";

interface Props {
	locationId: Location["id"];
}

type Payload =
	| {
			type: "success";
			payload: Omit<Location, "createdAt">;
	  }
	| {
			type: "dismiss";
	  };

const UpdateFormSchema = v.object({
	name: LocationSchemas.Name,
	description: LocationSchemas.Description,
});

type UpdateFormValues = v.InferInput<typeof UpdateFormSchema>;

const DescriptionPreview = ({ description }: { description: string }) => {
	const { reactContent } = useMarkdown(description);
	return (
		<div
			className={css({
				height: "auto",
				maxHeight: "300px",
				overflowY: "auto",
				border: "1px solid",
				borderColor: "gray.300",
				padding: 2,
				borderRadius: "md",
			})}
		>
			{reactContent}
		</div>
	);
};

export const EditLocationDialog = createCallable<Props, Payload>(
	({ call, locationId }) => {
		const { data: location, isLoading } = useLocationDetail({ locationId });
		const [isDescirptionPreviewShown, setIsDescirptionPreviewShown] =
			useState(false);

		const {
			handleSubmit,
			register,
			setValue,
			watch,
			formState: { errors },
		} = useForm<UpdateFormValues>({
			resolver: valibotResolver(UpdateFormSchema),
			defaultValues: {
				name: location?.name,
				description: location?.description,
			},
		});

		useEffect(() => {
			if (location) {
				setValue("name", location.name);
				setValue("description", location.description);
			}
		}, [location, setValue]);

		const onSubmit = async (values: UpdateFormValues) => {
			if (!location) return;
			const updatedLocation: Location = {
				...location,
				...values,
			};
			call.end({ type: "success", payload: updatedLocation });
		};

		return (
			<Dialog
				title="活動場所を編集"
				isOpen
				isDismissable
				onOpenChange={(isOpen) => {
					if (!isOpen) call.end({ type: "dismiss" });
				}}
			>
				{location && (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className={css({
							display: "grid",
							gap: 4,
							gridTemplateColumns: "1fr",
						})}
					>
						<Form.Field.TextInput
							label="場所名"
							required
							error={errors.name?.message}
							{...register("name")}
						/>

						<Switch.List>
							<Switch.Item
								isActive={!isDescirptionPreviewShown}
								onClick={() => setIsDescirptionPreviewShown(false)}
							>
								Edit
							</Switch.Item>
							<Switch.Item
								isActive={isDescirptionPreviewShown}
								onClick={() => setIsDescirptionPreviewShown(true)}
							>
								Preview
							</Switch.Item>
						</Switch.List>

						{isDescirptionPreviewShown ? (
							<DescriptionPreview description={watch("description")} />
						) : (
							<Form.Field.TextArea
								label="説明"
								required
								rows={LOCATION_DESCRIPTION_MAX_LINES}
								error={errors.description?.message}
								{...register("description")}
							/>
						)}

						<div
							className={css({
								display: "flex",
								justifyContent: "center",
								gap: 4,
								gridColumn: "1 / -1",
								marginTop: 4,
							})}
						>
							<button
								type="button"
								onClick={() => call.end({ type: "dismiss" })}
							>
								<ButtonLike variant="secondary">キャンセル</ButtonLike>
							</button>
							<button type="submit">
								<ButtonLike variant="primary">更新</ButtonLike>
							</button>
						</div>
					</form>
				)}
				{!location && isLoading && "読み込み中..."}
				{!location && !isLoading && "活動場所が見つかりませんでした"}
			</Dialog>
		);
	},
);
