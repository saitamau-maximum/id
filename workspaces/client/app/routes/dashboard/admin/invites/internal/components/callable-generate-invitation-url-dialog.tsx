import { valibotResolver } from "@hookform/resolvers/valibot";
import { InviteCreateParams } from "@idp/schema/api/invite";
import { createCallable } from "react-call";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Dialog } from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";

type Payload =
	| {
			type: "success";
			payload: InviteCreateParams;
	  }
	| {
			type: "dismiss";
	  };

type CreateFormInputValues = v.InferInput<typeof InviteCreateParams>;
type CreateFormOutputValues = v.InferOutput<typeof InviteCreateParams>;

export const GenerateInvitationURLDialog = createCallable<void, Payload>(
	({ call }) => {
		const {
			handleSubmit,
			register,
			formState: { errors },
		} = useForm<CreateFormInputValues, unknown, CreateFormOutputValues>({
			resolver: valibotResolver(InviteCreateParams),
		});

		const onSubmit = async (values: CreateFormOutputValues) => {
			call.end({
				type: "success",
				payload: values,
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
								if (value === "") return undefined;
								// parseInt だと小数点以下が切り捨てられてしまうため、 Number で変換してから Valibot 側で整数バリデーションを行う
								return Number(value);
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
										setValueAs: (value) =>
											// Valibot は ISOTimestamp 形式を期待しているので変換
											value ? new Date(value).toISOString() : undefined,
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
