import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { useMarkdown } from "~/hooks/use-markdown";
import {
	LOCATION_DESCRIPTION_MAX_LINES,
	LocationSchemas,
} from "~/schema/location";
import type { Location } from "~/types/location";

type Payload =
	| {
			type: "success";
			payload: Omit<Location, "id" | "createdAt">;
	  }
	| {
			type: "dismiss";
	  };

const CreateFormSchema = v.object({
	name: LocationSchemas.Name,
	description: LocationSchemas.Description,
});

type CreateFormValues = v.InferInput<typeof CreateFormSchema>;

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

export const CreateLocationDialog = createCallable<void, Payload>(
	({ call }) => {
		const [isDescirptionPreviewShown, setIsDescirptionPreviewShown] =
			useState(false);

		const {
			handleSubmit,
			register,
			formState: { errors },
			watch,
		} = useForm<CreateFormValues>({
			resolver: valibotResolver(CreateFormSchema),
		});

		const onSubmit = async (values: CreateFormValues) => {
			call.end({
				type: "success",
				payload: {
					...values,
				},
			});
		};

		return (
			<Dialog
				title="活動場所を作成"
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
						label="場所名"
						required
						error={errors.name?.message}
						{...register("name")}
					/>

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
						<button type="button" onClick={() => call.end({ type: "dismiss" })}>
							<ButtonLike variant="secondary">キャンセル</ButtonLike>
						</button>
						<button type="submit">
							<ButtonLike variant="primary">作成</ButtonLike>
						</button>
					</div>
				</form>
			</Dialog>
		);
	},
);
