import { valibotResolver } from "@hookform/resolvers/valibot";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { useLocations } from "~/routes/dashboard/calendar/hooks/use-locations";
import { EVENT_DESCRIPTION_MAX_LINES, EventSchemas } from "~/schema/event";
import type { CalendarEventWithNotify } from "~/types/event";
import { DescriptionFormField } from "./detail-form-field";

type Payload =
	| {
			type: "success";
			payload: Omit<CalendarEventWithNotify, "id" | "userId">;
	  }
	| {
			type: "dismiss";
	  };

const CreateFormSchema = v.object({
	title: EventSchemas.Title,
	description: EventSchemas.Description,
	startAt: EventSchemas.StartAt,
	endAt: EventSchemas.EndAt,
	locationId: EventSchemas.LocationId,
	notifyDiscord: EventSchemas.NotifyDiscord,
});

type CreateFormInputValues = v.InferInput<typeof CreateFormSchema>;
type CreateFormOutputValues = v.InferOutput<typeof CreateFormSchema>;

export const CreateEventDialog = createCallable<void, Payload>(({ call }) => {
	const { locations } = useLocations();

	const {
		handleSubmit,
		register,
		watch,
		setError,
		formState: { errors },
	} = useForm<CreateFormInputValues, unknown, CreateFormOutputValues>({
		resolver: valibotResolver(CreateFormSchema),
		defaultValues: {
			locationId: null,
		},
	});

	const onSubmit = async (values: CreateFormOutputValues) => {
		if (values.startAt >= values.endAt) {
			setError("root", {
				message: "終了日時は開始日時よりも後にしてください",
			});
			return;
		}

		call.end({
			type: "success",
			payload: {
				...values,
				startAt: new Date(values.startAt),
				endAt: new Date(values.endAt),
				locationId: values.locationId ?? undefined,
			},
		});
	};

	return (
		<Dialog
			title="イベントを作成"
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
					description={watch("description")}
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
						label="Discordに通知する"
						{...register("notifyDiscord")}
						defaultChecked={false}
					/>
					<ErrorDisplay error={errors.notifyDiscord?.message} />
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
						<ButtonLike variant="primary">作成</ButtonLike>
					</button>
				</div>
			</form>
		</Dialog>
	);
});
