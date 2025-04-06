import { valibotResolver } from "@hookform/resolvers/valibot";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { GRADE } from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { UserSchemas } from "~/schema/user";
import { useRegister } from "../hooks/use-register";

const RegisterFormSchema = v.object({
	displayName: UserSchemas.DisplayName,
	realName: UserSchemas.RealName,
	realNameKana: UserSchemas.RealNameKana,
	displayId: UserSchemas.DisplayId,
	email: UserSchemas.Email,
	academicEmail: UserSchemas.AcademicEmail,
	studentId: UserSchemas.StudentId,
	grade: UserSchemas.Grade,
});

type FormValues = v.InferOutput<typeof RegisterFormSchema>;

export const RegisterForm = () => {
	const { mutate, isPending } = useRegister();
	const { user } = useAuth();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: valibotResolver(RegisterFormSchema),
		defaultValues: {
			displayName: user?.displayName,
			realName: user?.realName,
			realNameKana: user?.realNameKana,
			displayId: user?.displayId,
			email: user?.email,
			academicEmail: user?.academicEmail,
			studentId: user?.studentId,
			grade: user?.grade,
		},
	});

	return (
		<form
			onSubmit={handleSubmit((d) => mutate(d))}
			className={css({
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 6,
				alignItems: "center",
			})}
		>
			<Form.Field.TextInput
				label="ID (半角英小文字、半角数字、アンダースコア(_)で3文字以上16文字以下)"
				error={errors.displayId?.message}
				placeholder="maximum_taro"
				required
				{...register("displayId")}
			/>

			<Form.Field.TextInput
				label="ユーザー名"
				error={errors.displayName?.message}
				placeholder="Maximum"
				required
				{...register("displayName")}
			/>

			<Form.Field.TextInput
				label="本名 (学生証に記載のもの)"
				error={errors.realName?.message}
				placeholder="山田 太郎"
				required
				{...register("realName")}
			/>

			<Form.Field.TextInput
				label="本名 (カナ)"
				error={errors.realNameKana?.message}
				placeholder="ヤマダ タロウ"
				required
				{...register("realNameKana")}
			/>

			<Form.Field.TextInput
				label="大学のメールアドレス"
				error={errors.academicEmail?.message}
				placeholder="student@ms.saitama-u.ac.jp"
				required
				{...register("academicEmail")}
			/>

			<Form.Field.TextInput
				label="大学以外で連絡の取れるメールアドレス"
				error={errors.email?.message}
				placeholder="member@maximum.vc"
				required
				{...register("email")}
			/>

			<Form.Field.TextInput
				label="学籍番号"
				error={errors.studentId?.message}
				placeholder="00XX000"
				required
				{...register("studentId")}
			/>

			<Form.FieldSet>
				<legend>
					<Form.LabelText>現在の学年</Form.LabelText>
				</legend>
				<div
					className={css({
						display: "grid",
						gap: "token(spacing.2) token(spacing.4)",
						gridTemplateColumns: "auto 1fr",
						alignItems: "center",
					})}
				>
					{GRADE.map((g) => (
						<Fragment key={g.label}>
							<Form.LabelText>{g.label}</Form.LabelText>
							<Form.RadioGroup>
								{g.identifier.map((identifier) => (
									<Form.Radio
										key={identifier}
										value={identifier}
										label={identifier}
										required
										{...register("grade")}
									/>
								))}
							</Form.RadioGroup>
						</Fragment>
					))}
				</div>
				<ErrorDisplay error={errors.grade?.message} />
			</Form.FieldSet>

			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					はじめる
				</ButtonLike>
			</button>
		</form>
	);
};
