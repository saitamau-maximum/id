import { DEPARTMENT_BY_ID } from "@idp/schema/entity/department";
import { FACULTY_BY_ID, FACULTY_IDS } from "@idp/schema/entity/faculty";
import {
	GRADE_BY_ID,
	type GradeId,
	isGraduateGrade,
	isOutsideGrade,
} from "@idp/schema/entity/grade";
import { Fragment } from "react";
import { useFormContext } from "react-hook-form";
import { css } from "styled-system/css";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { RequiredIndicator } from "~/components/ui/form/required-indicator";
import { GRADE_CATEGORIES } from "~/constant";
import type { FormInputValues, FormOutputValues } from "../types";

export const UserSettingFormAcademic = () => {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<FormInputValues, unknown, FormOutputValues>();

	const isOutsideMember = ((val?: string) => {
		if (!val) return false;
		return isOutsideGrade(Number.parseInt(val, 10) as GradeId);
	})(watch("grade"));
	const isGraduateStudent = ((val?: string) => {
		if (!val) return false;
		return isGraduateGrade(Number.parseInt(val, 10) as GradeId);
	})(watch("grade"));

	const selectedFaculty = watch("faculty");
	const departmentBySelectedFaculty = Object.values(DEPARTMENT_BY_ID).filter(
		(dept) =>
			selectedFaculty &&
			dept.facultyId === Number.parseInt(selectedFaculty, 10),
	);

	return (
		<>
			<Form.FieldSet>
				<legend>
					<span
						className={css({
							fontSize: "md",
							color: "gray.600",
						})}
					>
						学年
					</span>
					<RequiredIndicator />
				</legend>
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
					{GRADE_CATEGORIES.map((g) => (
						<Fragment key={g.label}>
							<Form.LabelText>{g.label}</Form.LabelText>
							<Form.RadioGroup>
								{g.identifier.map((identifier) => (
									<Form.Radio
										key={identifier}
										value={identifier}
										label={GRADE_BY_ID[identifier].name}
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

			<Form.FieldSet
				className={css({
					display: "grid",
					gap: "token(spacing.2) token(spacing.4)",
					gridTemplateColumns: "auto 1fr",
					alignItems: "center",
					mdDown: { gridTemplateColumns: "1fr !important" },
				})}
			>
				<div>
					<legend>
						<Form.LabelText>
							学部
							{!isOutsideMember && <RequiredIndicator />}
						</Form.LabelText>
					</legend>
				</div>
				<Form.RadioGroup>
					{Object.values(FACULTY_IDS).map((id) => {
						const faculty = FACULTY_BY_ID[id];
						return (
							<Form.Radio
								key={faculty.id}
								value={faculty.id}
								label={faculty.name}
								required={!isOutsideMember}
								{...register("faculty", {
									onChange: () => {
										// 学部を変えたら学科の選択をリセット
										setValue("department", undefined);
									},
								})}
							/>
						);
					})}
				</Form.RadioGroup>
				<ErrorDisplay error={errors.faculty?.message} />
			</Form.FieldSet>

			<Form.FieldSet
				className={css({
					display: "grid",
					gap: "token(spacing.2) token(spacing.4)",
					gridTemplateColumns: "auto 1fr",
					alignItems: "center",
					mdDown: { gridTemplateColumns: "1fr !important" },
				})}
			>
				<div>
					<legend>
						<Form.LabelText>
							学科
							{!isOutsideMember && <RequiredIndicator />}
						</Form.LabelText>
					</legend>
				</div>
				<Form.RadioGroup>
					{!selectedFaculty ? (
						<p
							className={css({
								fontSize: "sm",
								color: "gray.500",
							})}
						>
							学部を選択してください
						</p>
					) : departmentBySelectedFaculty.length === 0 ? (
						<p
							className={css({
								fontSize: "sm",
								color: "gray.500",
							})}
						>
							この学部には学科がありません
						</p>
					) : (
						departmentBySelectedFaculty.map((dept) => (
							<Form.Radio
								key={dept.id}
								value={dept.id}
								label={dept.name}
								required={!isOutsideMember}
								{...register("department")}
							/>
						))
					)}
				</Form.RadioGroup>
				<ErrorDisplay error={errors.faculty?.message} />
			</Form.FieldSet>

			<Form.Field.TextInput
				label="研究室"
				error={errors.laboratory?.message}
				placeholder="田中研究室"
				{...register("laboratory", {
					setValueAs: (value) => value || undefined,
				})}
			/>

			{(isGraduateStudent || isOutsideMember) && (
				<>
					<Form.Field.TextInput
						label="研究科"
						error={errors.graduateSchool?.message}
						placeholder="理工学研究科"
						{...register("graduateSchool", {
							setValueAs: (value) => value || undefined,
						})}
					/>

					<Form.Field.TextInput
						label="専攻"
						error={errors.specialization?.message}
						placeholder="数理電子情報専攻"
						{...register("specialization", {
							setValueAs: (value) => value || undefined,
						})}
					/>
				</>
			)}

			<Form.Field.TextInput
				label="学籍番号"
				error={errors.studentId?.message}
				additionalInfo={`
					大学に届け出る書類に必要となるため、正しく入力してください。
				`}
				placeholder="00XX000"
				required={!isOutsideMember}
				{...register("studentId", {
					setValueAs: (value) => value || undefined,
				})}
			/>

			<Form.Field.TextInput
				label="大学のメールアドレス"
				error={errors.academicEmail?.message}
				additionalInfo="~@ms.saitama-u.ac.jp のメールアドレスを入力してください。"
				placeholder="student@ms.saitama-u.ac.jp"
				required={!isOutsideMember}
				type="email"
				{...register("academicEmail", {
					setValueAs: (value) => value || undefined,
				})}
			/>
		</>
	);
};
