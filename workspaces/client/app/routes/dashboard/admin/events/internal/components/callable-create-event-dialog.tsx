import { valibotResolver } from "@hookform/resolvers/valibot";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { EVENT_DESCRIPTION_MAX_LINES, EventSchemas } from "~/schema/event";
import type { CalendarEvent } from "~/types/event";

type Payload =
	| {
			type: "success";
			payload: Omit<CalendarEvent, "id" | "userId">;
	  }
	| {
			type: "dismiss";
	  };

const CreateFormSchema = v.object({
	title: EventSchemas.Title,
	description: EventSchemas.Description,
	startAt: EventSchemas.StartAt,
	endAt: EventSchemas.EndAt,
});

type CreateFormValues = v.InferInput<typeof CreateFormSchema>;

export const CreateEventDialog = createCallable<void, Payload>(({ call }) => {
	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<CreateFormValues>({
		resolver: valibotResolver(CreateFormSchema),
	});

	const onSubmit = async (values: CreateFormValues) => {
		call.end({
			type: "success",
			payload: {
				...values,
				startAt: new Date(values.startAt),
				endAt: new Date(values.endAt),
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

				<Form.Field.TextArea
					label="説明"
					required
					rows={EVENT_DESCRIPTION_MAX_LINES}
					error={errors.description?.message}
					{...register("description")}
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
