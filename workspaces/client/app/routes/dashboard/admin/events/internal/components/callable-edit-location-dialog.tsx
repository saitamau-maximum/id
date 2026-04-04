import { valibotResolver } from "@hookform/resolvers/valibot";
import { CalendarLocationUpdateParams } from "@idp/schema/api/calendar/location";
import type { Location } from "@idp/schema/entity/calendar/location";
import { LOCATION_DESCRIPTION_MAX_LINES } from "@idp/schema/entity/calendar/location";
import { useEffect } from "react";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { useLocationDetail } from "~/routes/dashboard/calendar/hooks/use-location-detail";
import { DescriptionFormField } from "./detail-form-field";

interface Props {
	locationId: Location["id"];
}

type Payload =
	| {
			type: "success";
			payload: CalendarLocationUpdateParams;
	  }
	| {
			type: "dismiss";
	  };

type UpdateFormInputValues = v.InferInput<typeof CalendarLocationUpdateParams>;
type UpdateFormOutputValues = v.InferOutput<
	typeof CalendarLocationUpdateParams
>;

export const EditLocationDialog = createCallable<Props, Payload>(
	({ call, locationId }) => {
		const { data: location, isLoading } = useLocationDetail({ locationId });

		const {
			handleSubmit,
			register,
			setValue,
			watch,
			formState: { errors },
		} = useForm<UpdateFormInputValues, unknown, UpdateFormOutputValues>({
			resolver: valibotResolver(CalendarLocationUpdateParams),
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

		const onSubmit = async (values: UpdateFormOutputValues) => {
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
