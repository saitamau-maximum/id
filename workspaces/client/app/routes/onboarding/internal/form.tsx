import { Fragment, useActionState, useCallback, useId } from "react";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";

import { useNavigate } from "react-router";
import * as v from "valibot";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";
import { GRADE } from "~/constant";
import { UserSchemas } from "~/schema/user";

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
	const realNameId = useId();
	const realNameKanaId = useId();
	const displayIdId = useId();
	const emailId = useId();
	const academicEmailId = useId();
	const studentId = useId();
	const gradeId = useId();
	const navigate = useNavigate();

	const RegisterFormAction = useCallback(
		async (
			_prevState: RegisterFormStateType,
			formData: FormData,
		): Promise<RegisterFormStateType> => {
			const displayName = formData.get("displayName");
			const realName = formData.get("realName");
			const realNameKana = formData.get("realNameKana");
			const displayId = formData.get("displayId");
			const email = formData.get("email");
			const academicEmail = formData.get("academicEmail");
			const studentId = formData.get("studentId");
			const grade = formData.get("grade");

			const result = v.safeParse(RegisterFormSchema, {
				displayName,
				realName,
				realNameKana,
				displayId,
				email,
				academicEmail,
				studentId,
				grade,
			});

			if (!result.success) {
				const errors = v.flatten<typeof RegisterFormSchema>(result.issues);
				return {
					default: {
						displayName: displayName?.toString() ?? undefined,
						realName: realName?.toString() ?? undefined,
						realNameKana: realNameKana?.toString() ?? undefined,
						displayId: displayId?.toString() ?? undefined,
						email: email?.toString() ?? undefined,
						academicEmail: academicEmail?.toString() ?? undefined,
						studentId: studentId?.toString() ?? undefined,
						grade: grade?.toString() ?? undefined,
					},
					error: {
						displayName: errors.nested?.displayName
							? errors.nested.displayName.join(", ")
							: undefined,
						realName: errors.nested?.realName
							? errors.nested.realName.join(", ")
							: undefined,
						realNameKana: errors.nested?.realNameKana
							? errors.nested.realNameKana.join(", ")
							: undefined,
						displayId: errors.nested?.displayId
							? errors.nested.displayId.join(", ")
							: undefined,
						email: errors.nested?.email
							? errors.nested.email.join(", ")
							: undefined,
						academicEmail: errors.nested?.academicEmail
							? errors.nested.academicEmail.join(", ")
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
					result.output.realName,
					result.output.realNameKana,
					result.output.displayId,
					result.output.email,
					result.output.academicEmail,
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
						displayName: result.output.displayName,
						realName: result.output.realName,
						realNameKana: result.output.realNameKana,
						displayId: result.output.displayId,
						email: result.output.email,
						academicEmail: result.output.academicEmail,
						studentId: result.output.studentId,
						grade: result.output.grade,
					},
					error: { message: "ユーザー登録に失敗しました" },
				};
			}
		},
		[userRepository, navigate],
	);

	const [state, submitAction, isPending] = useActionState(RegisterFormAction, {
		default: {
			displayName: user?.displayName,
			realName: user?.realName,
			realNameKana: user?.realNameKana,
			displayId: user?.displayId,
			email: user?.email,
			academicEmail: user?.academicEmail,
			studentId: user?.studentId,
			grade: user?.grade,
		},
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
				<label htmlFor={displayIdId}>
					<Form.LabelText>
						ID (半角英小文字、半角数字、アンダースコア(_)で3文字以上16文字以下)
					</Form.LabelText>
				</label>
				<Form.Input
					id={displayIdId}
					placeholder="maximum_taro"
					required
					name="displayId"
					defaultValue={state.default.displayId}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.displayId}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={displayNameId}>
					<Form.LabelText>ユーザー名</Form.LabelText>
				</label>
				<Form.Input
					id={displayNameId}
					placeholder="Maximum"
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
				<label htmlFor={realNameId}>
					<Form.LabelText>本名 (学生証に記載のもの)</Form.LabelText>
				</label>
				<Form.Input
					id={realNameId}
					placeholder="山田 太郎"
					required
					name="realName"
					defaultValue={state.default.realName}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.realName}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={realNameKanaId}>
					<Form.LabelText>本名 (カナ)</Form.LabelText>
				</label>
				<Form.Input
					id={realNameKanaId}
					placeholder="ヤマダ タロウ"
					required
					name="realNameKana"
					defaultValue={state.default.realNameKana}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.realNameKana}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={academicEmailId}>
					<Form.LabelText>大学のメールアドレス</Form.LabelText>
				</label>
				<Form.Input
					id={academicEmailId}
					placeholder="student@ms.saitama-u.ac.jp"
					required
					type="email"
					name="academicEmail"
					defaultValue={state.default.academicEmail}
				/>
				<p
					className={css({
						color: "red.600",
						fontSize: "sm",
					})}
				>
					{state.error.academicEmail}
				</p>
			</Form.FieldSet>
			<Form.FieldSet>
				<label htmlFor={emailId}>
					<Form.LabelText>大学以外で連絡の取れるメールアドレス</Form.LabelText>
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
