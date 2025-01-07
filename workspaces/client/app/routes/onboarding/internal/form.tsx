import { Fragment, useActionState, useCallback, useId } from "react";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";

import { useNavigate } from "react-router";
import * as v from "valibot";
import { useAuth } from "~/hooks/useAuth";
import { useRepository } from "~/hooks/useRepository";

const GRADE = [
	{ label: "学部 (Bachelor)", identifier: ["B1", "B2", "B3", "B4"] },
	{ label: "修士 (Master)", identifier: ["M1", "M2"] },
	{ label: "博士 (Docker)", identifier: ["D1", "D2"] },
];

const RegisterFormSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty("表示名を入力してください")),
	email: v.pipe(
		v.string(),
		v.nonEmpty("メールアドレスを入力してください"),
		v.email("メールアドレスの形式が正しくありません"),
	),
	studentId: v.pipe(
		v.string(),
		v.regex(
			/^\d{2}[A-Z]{2}\d{3}$/,
			"学籍番号の形式が正しくありません、半角数字と半角英大文字で00XX000の形式で入力してください。",
		),
	),
	grade: v.pipe(v.string(), v.nonEmpty("学年を選択してください")),
});

type RegisterFormSchemaType = v.InferInput<typeof RegisterFormSchema>;

type RegisterFormStateType = {
	default: Partial<RegisterFormSchemaType>;
	error: Partial<RegisterFormSchemaType> & {
		message?: string;
	};
};

export const RegisterForm = () => {
	const { userRepository } = useRepository();
	const { user } = useAuth();
	const displayNameId = useId();
	const emailId = useId();
	const studentId = useId();
	const gradeId = useId();
	const navigate = useNavigate();

	const RegisterFormAction = useCallback(
		async (
			_prevState: RegisterFormStateType,
			formData: FormData,
		): Promise<RegisterFormStateType> => {
			const displayName = formData.get("displayName");
			const email = formData.get("email");
			const studentId = formData.get("studentId");
			const grade = formData.get("grade");

			const result = v.safeParse(RegisterFormSchema, {
				displayName,
				email,
				studentId,
				grade,
			});

			if (!result.success) {
				const errors = v.flatten<typeof RegisterFormSchema>(result.issues);
				return {
					default: {
						displayName: displayName?.toString() ?? undefined,
						email: email?.toString() ?? undefined,
						studentId: studentId?.toString() ?? undefined,
						grade: grade?.toString() ?? undefined,
					},
					error: {
						displayName: errors.nested?.displayName
							? errors.nested.displayName.join(", ")
							: undefined,
						email: errors.nested?.email
							? errors.nested.email.join(", ")
							: undefined,
						studentId: errors.nested?.studentId
							? errors.nested.studentId.join(", ")
							: undefined,
						grade: errors.nested?.grade
							? errors.nested.grade.join(", ")
							: undefined,
					},
				};
			}

			try {
				await userRepository.register(
					result.output.displayName,
					result.output.email,
					result.output.studentId,
					result.output.grade,
				);

				navigate("/");

				return {
					default: {},
					error: {},
				};
			} catch (e) {
				return {
					default: {
						displayName: displayName?.toString() ?? undefined,
						email: email?.toString() ?? undefined,
						studentId: studentId?.toString() ?? undefined,
						grade: grade?.toString() ?? undefined,
					},
					error: { message: "ユーザー登録に失敗しました" },
				};
			}
		},
		[userRepository, navigate],
	);

	const [state, submitAction, isPending] = useActionState(RegisterFormAction, {
		default: {},
		error: {},
	});

	return (
		<form
			className={css({
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 6,
			})}
			action={submitAction}
		>
			<Form.FieldSet>
				<label htmlFor={displayNameId}>
					<Form.LabelText>表示名</Form.LabelText>
				</label>
				<Form.Input
					id={displayNameId}
					placeholder="Maximum 太郎"
					required
					name="displayName"
					defaultValue={state.default.displayName}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.displayName}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={emailId}>
					<Form.LabelText>メールアドレス</Form.LabelText>
				</label>
				<Form.Input
					id={emailId}
					placeholder="member@maximum.vc"
					required
					type="email"
					name="email"
					defaultValue={state.default.email}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.email}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={studentId}>
					<Form.LabelText>学籍番号</Form.LabelText>
				</label>
				<Form.Input
					id={studentId}
					placeholder="00XX000"
					required
					name="studentId"
					defaultValue={state.default.studentId}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.studentId}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={gradeId}>
					<Form.LabelText>現在の学年</Form.LabelText>
				</label>
				<div
					className={css({
						display: "grid",
						gap: "token(spacing.2) token(spacing.4)",
						gridTemplateColumns: "auto 1fr",
						alignItems: "center",
					})}
				>
					{GRADE.map((grade) => (
						<Fragment key={grade.label}>
							<Form.LabelText>{grade.label}</Form.LabelText>
							<Form.RadioGroup>
								{grade.identifier.map((identifier) => (
									<Form.Radio
										key={identifier}
										name="grade"
										value={identifier}
										label={identifier}
										defaultChecked={state.default.grade === identifier}
									/>
								))}
							</Form.RadioGroup>
						</Fragment>
					))}
				</div>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.grade}
				</p>
			</Form.FieldSet>
			{state.error.message && (
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.message}
				</p>
			)}
			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					はじめる
				</ButtonLike>
			</button>
		</form>
	);
};
