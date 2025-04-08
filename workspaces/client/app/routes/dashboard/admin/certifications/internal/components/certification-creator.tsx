import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useCreateCertification } from "../hooks/use-create-certification";

const CreateFormSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
});

type FormInputValues = v.InferInput<typeof CreateFormSchema>;
type FormOutputValues = v.InferOutput<typeof CreateFormSchema>;

export const CertificationCreator = () => {
	const { mutate, isPending } = useCreateCertification();

	const { register, handleSubmit, reset } = useForm<
		FormInputValues,
		unknown,
		FormOutputValues
	>({
		resolver: valibotResolver(CreateFormSchema),
	});

	return (
		<div>
			<h2
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
					color: "gray.600",
					marginTop: 6,
					marginBottom: 4,
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
				className={css({
					width: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 6,
					alignItems: "center",
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
				<div
					className={css({
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: 6,
						alignItems: "center",
						justifyContent: "center",
					})}
				>
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
				</div>
			</form>
		</div>
	);
};
