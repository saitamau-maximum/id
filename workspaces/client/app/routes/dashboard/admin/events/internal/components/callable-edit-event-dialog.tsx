import { valibotResolver } from "@hookform/resolvers/valibot";
import { UpdateEventParams } from "@idp/schema/api/calendar/events";
import {
	EVENT_DESCRIPTION_MAX_LINES,
	type Event,
	type EventWithNotify,
} from "@idp/schema/entity/calendar/event";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { useLocations } from "~/routes/dashboard/calendar/hooks/use-locations";
import { toHTMLDateTimePickerFormat } from "~/utils/date";
import { DescriptionFormField } from "./detail-form-field";

interface Props {
	event: Event;
}

type Payload =
	| {
			type: "success";
			payload: EventWithNotify;
	  }
	| {
			type: "dismiss";
	  };

type UpdateFormInputValues = v.InferInput<typeof UpdateEventParams>;
type UpdateFormOutputValues = v.InferOutput<typeof UpdateEventParams>;

export const EditEventDialog = createCallable<Props, Payload>(
	({ call, event }) => {
		const { locations } = useLocations();
		const {
			handleSubmit,
			register,
			watch,
			formState: { errors },
		} = useForm<UpdateFormInputValues, unknown, UpdateFormOutputValues>({
			resolver: valibotResolver(UpdateEventParams),
			defaultValues: {
				title: event.title,
				description: event.description,
				startAt: toHTMLDateTimePickerFormat(event.startAt),
				endAt: toHTMLDateTimePickerFormat(event.endAt),
				// RHF の仕様上、未選択状態は null になってしまいスキーマエラーになっちゃうので、空文字をデフォルト値にしておく
				locationId: event.locationId ?? "",
			},
		});

		const onSubmit = async (values: UpdateFormOutputValues) => {
			// 変更があった場合はフォームの値を、ない場合は元の値を使う
			const locationId =
				values.locationId !== event.locationId
					? values.locationId
					: event.locationId;
			const updatedEvent: EventWithNotify = {
				...event,
				...values,
				locationId: locationId ? locationId : undefined, // 空文字は undefined に変換して送る
			};
			call.end({ type: "success", payload: updatedEvent });
		};

		return (
			<Dialog
				title="イベントを編集"
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
						label="タイトル"
						required
						error={errors.title?.message}
						{...register("title")}
					/>

					<DescriptionFormField
						description={watch("description") || ""}
						rows={EVENT_DESCRIPTION_MAX_LINES}
						error={errors.description?.message}
						register={register("description")}
						inlineOnly={true} //  イベントはインライン文法のみ
					/>

					<Form.Field.WithLabel label="開始日時" required>
						{(id) => (
							<>
								<Form.Input
									id={id}
									required
									type="datetime-local"
									{...register("startAt")}
								/>
								<ErrorDisplay error={errors.startAt?.message} />
							</>
						)}
					</Form.Field.WithLabel>

					<Form.Field.WithLabel label="終了日時" required>
						{(id) => (
							<>
								<Form.Input
									id={id}
									required
									type="datetime-local"
									{...register("endAt")}
								/>
								<ErrorDisplay error={errors.endAt?.message} />
							</>
						)}
					</Form.Field.WithLabel>

					<Form.FieldSet>
						<legend>
							<Form.LabelText>活動場所</Form.LabelText>
						</legend>
						<Form.RadioGroup>
							{locations.map((location) => (
								<Form.Radio
									key={location.id}
									value={location.id}
									label={location.name}
									{...register("locationId")}
								/>
							))}
						</Form.RadioGroup>
						<ErrorDisplay error={errors.locationId?.message} />
					</Form.FieldSet>

					<Form.FieldSet>
						<Form.Select
							label="更新をDiscordに通知する"
							{...register("notifyDiscord")}
							defaultChecked={false}
						/>
					</Form.FieldSet>

					<ErrorDisplay error={errors.root?.message} />

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
							<ButtonLike variant="primary">更新</ButtonLike>
						</button>
					</div>
				</form>
			</Dialog>
		);
	},
);
