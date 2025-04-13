import { valibotResolver } from "@hookform/resolvers/valibot";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { InvitationURLSchemas } from "~/schema/invitaiton";

type Payload =
	| {
			type: "success";
			payload: {
				expiresAt: Date | null;
				remainingUse: number | null;
				title: string;
			};
	  }
	| {
			type: "dismiss";
	  };

const CreateFormSchema = v.object({
	title: InvitationURLSchemas.Title,
	expiresAt: InvitationURLSchemas.ExpiresAt,
	remainingUse: InvitationURLSchemas.RemainingUse,
});

type CreateFormInputValues = v.InferInput<typeof CreateFormSchema>;
type CreateFormOutputValues = v.InferOutput<typeof CreateFormSchema>;

export const GenerateInvitationURLDialog = createCallable<void, Payload>(
	({ call }) => {
		const {
			handleSubmit,
			register,
			setError,
			formState: { errors },
		} = useForm<CreateFormInputValues, unknown, CreateFormOutputValues>({
			resolver: valibotResolver(CreateFormSchema),
			defaultValues: {
				expiresAt: null,
				remainingUse: null,
			},
		});

		const onSubmit = async (values: CreateFormOutputValues) => {
			if (!values.expiresAt && !values.remainingUse) {
				setError("root", {
					message: "使用可能回数または有効期限のいずれかは必須です",
				});
				return;
			}
			call.end({
				type: "success",
				payload: {
					...values,
				},
			});
		};

		return (
			<Dialog
				title="招待リンクの作成"
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
						type="text"
						error={errors.title?.message}
						required
						{...register("title")}
					/>

					<Form.Field.TextInput
						label="使用可能回数"
						type="number"
						error={errors.remainingUse?.message}
						{...register("remainingUse", {
							setValueAs: (value) => {
								if (value === "") return null;
								return value;
							},
						})}
					/>

					<Form.Field.WithLabel label="有効期限">
						{(id) => (
							<>
								<Form.Input
									id={id}
									type="datetime-local"
									{...register("expiresAt", {
										setValueAs: (value) => {
											if (value === "") return null;
											return value;
										},
									})}
								/>
								<ErrorDisplay error={errors.expiresAt?.message} />
							</>
						)}
					</Form.Field.WithLabel>

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
	},
);
