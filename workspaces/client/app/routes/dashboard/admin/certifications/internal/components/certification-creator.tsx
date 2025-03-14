import { valibotResolver } from "@hookform/resolvers/valibot";
import {} from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useCreateCertification } from "../hooks/use-create-certification";

const CreateFormSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.optional(v.string()),
});

type FormValues = v.InferInput<typeof CreateFormSchema>;

export const CertificationCreator = () => {
	const { mutate, isPending } = useCreateCertification();

	const { register, handleSubmit, reset } = useForm<FormValues>({
		resolver: valibotResolver(CreateFormSchema),
	});

	return (
		<div>
			<h2
				className={css({
					fontSize: "2xl",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				新しい資格・試験を追加する
			</h2>
			<form
				onSubmit={handleSubmit((d) => {
					mutate(d, {
						onSuccess: () => reset(),
					});
				})}
			>
				<Form.Field.TextInput
					label="資格・試験名"
					required
					{...register("title")}
				/>
				<Form.Field.TextInput
					label="資格・試験の説明"
					{...register("description")}
				/>
				<button type="submit" disabled={isPending}>
					<ButtonLike variant="primary" disabled={isPending}>
						作成
					</ButtonLike>
				</button>
				<button type="reset" disabled={isPending}>
					<ButtonLike variant="secondary" disabled={isPending}>
						クリア
					</ButtonLike>
				</button>
			</form>
		</div>
	);
};
