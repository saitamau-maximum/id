import { valibotResolver } from "@hookform/resolvers/valibot";
import { Fragment, useCallback } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import {
	FACULTY,
	FacultyOfEducation,
	FacultyOfEngineering,
	FacultyOfLiberalArts,
	FacultyOfScience,
	GRADE,
	OUTSIDE_GRADE,
} from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { UserSchemas } from "~/schema/user";
import { useRegister } from "../hooks/use-register";

const RegisterFormSchema = v.object({
	displayName: UserSchemas.DisplayName,
	realName: UserSchemas.RealName,
	realNameKana: UserSchemas.RealNameKana,
	displayId: UserSchemas.DisplayId,
	email: UserSchemas.Email,
	academicEmail: v.optional(UserSchemas.AcademicEmail),
	studentId: v.optional(UserSchemas.StudentId),
	grade: UserSchemas.Grade,
	faculty: UserSchemas.Faculty,
	department: UserSchemas.Department,
	laboratory: v.optional(UserSchemas.Laboratory),
	graduateSchool: v.optional(UserSchemas.GraduateSchool),
	specialization: v.optional(UserSchemas.Specialization),
});

type FormInputValues = v.InferInput<typeof RegisterFormSchema>;
type FormOutputValues = v.InferOutput<typeof RegisterFormSchema>;

export const RegisterForm = () => {
	const { mutate, isPending } = useRegister();
	const { user } = useAuth();

	const {
		register,
		handleSubmit,
		watch,
		setError,
		formState: { errors },
	} = useForm<FormInputValues, unknown, FormOutputValues>({
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
			faculty: user?.faculty,
			department: user?.department,
			laboratory: user?.laboratory,
			graduateSchool: user?.graduateSchool,
			specialization: user?.specialization,
		},
	});

	const onSubmit = useCallback(
		(data: FormInputValues) => {
			const isOutsideMember = OUTSIDE_GRADE.includes(data.grade);
			const isGraduateStudent = ["M1", "M2", "D1", "D2", "D3"].includes(
				data.grade,
			);
			if (!isOutsideMember && !data.academicEmail) {
				setError("academicEmail", {
					message: "学籍番号と大学のメールアドレスは必須です",
				});
				return;
			}
			if (!isOutsideMember && !data.studentId) {
				setError("studentId", {
					message: "学籍番号と大学のメールアドレスは必須です",
				});
				return;
			}
			// M, D以上は研究室必須
			if (isGraduateStudent && !data.laboratory) {
				setError("laboratory", {
					message: "研究室を入力してください",
				});
				return;
			}
			mutate(data);
		},
		[mutate, setError],
	);

	const isOutsideMember = OUTSIDE_GRADE.includes(watch("grade"));
	const isGraduateStudent = ["M1", "M2", "D1", "D2", "D3"].includes(
		watch("grade"),
	);
	const selectedFaculty = watch("faculty");

	const departmentsByFaculty: Record<string, string[]> = {
		教養学部: FacultyOfLiberalArts[0]?.identifier ?? [],
		経済学部: [],
		教育学部: FacultyOfEducation[0]?.identifier ?? [],
		理学部: FacultyOfScience[0]?.identifier ?? [],
		工学部: FacultyOfEngineering[0]?.identifier ?? [],
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={css({
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 6,
				alignItems: "center",
			})}
		>
			<Form.FieldSet>
				<h2
					className={css({
						display: "block",
						fontSize: "md",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					はじめに、現在の学年を選択してください
					<span className={css({ color: "rose.500", marginLeft: 1 })}>*</span>
				</h2>
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
						marginBottom: 2,
					})}
				>
					埼玉大学に在籍していない方で、埼玉大学を卒業した方は「卒業生」を、それ以外の方は「ゲスト」を選択してください。
				</p>
				<div
					className={css({
						display: "grid",
						gap: "token(spacing.2) token(spacing.4)",
						gridTemplateColumns: "auto 1fr",
						alignItems: "center",
						mdDown: {
							gridTemplateColumns: "1fr !important",
						},
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
				label={`本名 ${isOutsideMember ? "" : "(学生証に記載のもの)"}`}
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

			{!isOutsideMember && !isGraduateStudent && (
				<>
					<Form.Field.WithLabel label="学部" required>
						{() => (
							<>
								<Form.RadioGroup>
									{FACULTY[0].identifier.map((identifier) => (
										<Form.Radio
											key={identifier}
											value={identifier}
											label={identifier}
											{...register("faculty")}
										/>
									))}
								</Form.RadioGroup>
								<ErrorDisplay error={errors.faculty?.message} />
							</>
						)}
					</Form.Field.WithLabel>

					{selectedFaculty &&
						selectedFaculty !== "経済学部" &&
						(departmentsByFaculty[selectedFaculty] ?? []).length > 0 && (
							<Form.Field.WithLabel label="学科" required>
								{() => (
									<>
										<Form.RadioGroup>
											{(departmentsByFaculty[selectedFaculty] ?? []).map(
												(dept) => (
													<Form.Radio
														key={dept}
														value={dept}
														label={dept}
														{...register("department")}
													/>
												),
											)}
										</Form.RadioGroup>
										<ErrorDisplay error={errors.department?.message} />
									</>
								)}
							</Form.Field.WithLabel>
						)}

					<Form.Field.TextInput
						label="研究室（任意）"
						error={errors.laboratory?.message}
						placeholder="田中研究室"
						{...register("laboratory", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="学籍番号"
						error={errors.studentId?.message}
						placeholder="00XX000"
						required
						{...register("studentId", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="大学のメールアドレス"
						error={errors.academicEmail?.message}
						placeholder="student@ms.saitama-u.ac.jp"
						required
						type="email"
						{...register("academicEmail", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>
				</>
			)}

			{isGraduateStudent && (
				<>
					<Form.Field.WithLabel label="学部" required>
						{() => (
							<>
								<Form.RadioGroup>
									{FACULTY[0].identifier.map((identifier) => (
										<Form.Radio
											key={identifier}
											value={identifier}
											label={identifier}
											{...register("faculty")}
										/>
									))}
								</Form.RadioGroup>
								<ErrorDisplay error={errors.faculty?.message} />
							</>
						)}
					</Form.Field.WithLabel>

					{selectedFaculty &&
						selectedFaculty !== "経済学部" &&
						(departmentsByFaculty[selectedFaculty] ?? []).length > 0 && (
							<Form.Field.WithLabel label="学科" required>
								{() => (
									<>
										<Form.RadioGroup>
											{(departmentsByFaculty[selectedFaculty] ?? []).map(
												(dept) => (
													<Form.Radio
														key={dept}
														value={dept}
														label={dept}
														{...register("department")}
													/>
												),
											)}
										</Form.RadioGroup>
										<ErrorDisplay error={errors.department?.message} />
									</>
								)}
							</Form.Field.WithLabel>
						)}

					<Form.Field.TextInput
						label="研究室"
						error={errors.laboratory?.message}
						placeholder="田中研究室"
						required
						{...register("laboratory", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="研究科"
						error={errors.graduateSchool?.message}
						placeholder="情報理工学研究科"
						required
						{...register("graduateSchool", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="専攻"
						error={errors.specialization?.message}
						placeholder="情報理工学専攻"
						required
						{...register("specialization", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="学籍番号"
						error={errors.studentId?.message}
						placeholder="00XX000"
						required
						{...register("studentId", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="大学のメールアドレス"
						error={errors.academicEmail?.message}
						placeholder="student@ms.saitama-u.ac.jp"
						required
						type="email"
						{...register("academicEmail", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>
				</>
			)}

			<Form.Field.TextInput
				label={`${isOutsideMember ? "" : "大学以外で"}連絡の取れるメールアドレス`}
				error={errors.email?.message}
				placeholder="member@maximum.vc"
				required
				{...register("email")}
			/>

			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					はじめる
				</ButtonLike>
			</button>
		</form>
	);
};
