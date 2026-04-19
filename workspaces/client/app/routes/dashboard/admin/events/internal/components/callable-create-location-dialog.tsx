import { valibotResolver } from "@hookform/resolvers/valibot";
import { CalendarLocationCreateParams } from "@idp/schema/api/calendar/location";
import { LOCATION_DESCRIPTION_MAX_LINES } from "@idp/schema/entity/calendar/location";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { DescriptionFormField } from "./detail-form-field";

type Payload =
	| {
			type: "success";
			payload: CalendarLocationCreateParams;
	  }
	| {
			type: "dismiss";
	  };

type CreateFormInputValues = v.InferInput<typeof CalendarLocationCreateParams>;
type CreateFormOutputValues = v.InferOutput<
	typeof CalendarLocationCreateParams
>;

export const CreateLocationDialog = createCallable<void, Payload>(
	({ call }) => {
		const {
			handleSubmit,
			register,
			formState: { errors },
			watch,
		} = useForm<CreateFormInputValues, unknown, CreateFormOutputValues>({
			resolver: valibotResolver(CalendarLocationCreateParams),
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

					<DescriptionFormField
						description={watch("description")}
						rows={LOCATION_DESCRIPTION_MAX_LINES}
						error={errors.description?.message}
						register={register("description")}
						inlineOnly={false} //  活動場所は画像などを埋め込むケースがあるため、ブロック文法も許可
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
							<ButtonLike variant="primary">作成</ButtonLike>
						</button>
					</div>
				</form>
			</Dialog>
		);
	},
);
