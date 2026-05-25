import { DEPARTMENT_BY_ID } from "@idp/schema/entity/department";
import {
	FACULTY_BY_ID,
	FACULTY_IDS,
	toFacultyId,
} from "@idp/schema/entity/faculty";
import {
	GRADE_BY_ID,
	isGraduateGrade,
	isOutsideGrade,
	toGradeId,
} from "@idp/schema/entity/grade";
import { Fragment } from "react";
import { useFormContext } from "react-hook-form";
import { css } from "styled-system/css";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { RequiredIndicator } from "~/components/ui/form/required-indicator";
import { GRADE_CATEGORIES } from "~/constant";
import type {
	ChildFormProps,
	FormInputValues,
	FormOutputValues,
} from "../types";

export const UserSettingFormAcademic = ({
	getFormErrorMessage,
}: ChildFormProps) => {
	const { register, watch, setValue, trigger } = useFormContext<
		FormInputValues,
		unknown,
		FormOutputValues
	>();

	const isOutsideMember = isOutsideGrade(toGradeId(watch("grade")));
	const isGraduateStudent = isGraduateGrade(toGradeId(watch("grade")));

	const selectedFaculty = watch("faculty");
	const departmentBySelectedFaculty = Object.values(DEPARTMENT_BY_ID).filter(
		(dept) =>
			selectedFaculty && dept.facultyId === toFacultyId(selectedFaculty),
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
										{...register("grade", {
											onChange: () => {
												// 学年を変えたらほかの required 状態が変化するので、 validation を走らせる
												trigger();
											},
										})}
									/>
								))}
							</Form.RadioGroup>
						</Fragment>
					))}
				</div>
				<ErrorDisplay error={getFormErrorMessage("grade")} />
			</Form.FieldSet>

			<Form.FieldSet
				className={css({
					display: "grid",
					gap: "token(spacing.2) token(spacing.4)",
					gridTemplateColumns: "auto 1fr",
					gridTemplateRows: "auto auto",
					alignItems: "center",
					mdDown: { gridTemplateColumns: "1fr !important" },
				})}
			>
				<legend
					className={css({
						gridColumn: "1 / -1",
						gridRow: "1 / -1",
						display: "contents",
					})}
				>
					<Form.LabelText>
						学部
						{!isOutsideMember && <RequiredIndicator />}
					</Form.LabelText>
				</legend>
				<Form.RadioGroup
					className={css({ gridColumn: "2 / -1", gridRow: "1 / -1" })}
				>
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
										// 学部を変えたら学科の選択をリセットし、 validation を走らせる
										setValue("department", undefined);
										trigger(["faculty", "department"]);
									},
								})}
							/>
						);
					})}
				</Form.RadioGroup>
				<ErrorDisplay
					error={getFormErrorMessage("faculty")}
					className={css({ gridColumn: "2 / -1", gridRow: "2 / -1" })}
				/>
			</Form.FieldSet>

			<Form.FieldSet
				className={css({
					display: "grid",
					gap: "token(spacing.2) token(spacing.4)",
					gridTemplateColumns: "auto 1fr",
					gridTemplateRows: "auto auto",
					alignItems: "center",
					mdDown: { gridTemplateColumns: "1fr !important" },
				})}
			>
				<legend
					className={css({
						gridColumn: "1 / -1",
						gridRow: "1 / -1",
						display: "contents",
					})}
				>
					<Form.LabelText>
						学科
						{!isOutsideMember && <RequiredIndicator />}
					</Form.LabelText>
				</legend>
				<Form.RadioGroup
					className={css({ gridColumn: "2 / -1", gridRow: "1 / -1" })}
				>
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
				<ErrorDisplay
					error={getFormErrorMessage("department")}
					className={css({ gridColumn: "2 / -1", gridRow: "2 / -1" })}
				/>
			</Form.FieldSet>

			<Form.Field.TextInput
				label="研究室"
				error={getFormErrorMessage("laboratory")}
				placeholder="田中研究室"
				{...register("laboratory", {
					setValueAs: (value) => value || undefined,
				})}
			/>

			{(isGraduateStudent || isOutsideMember) && (
				<>
					<Form.Field.TextInput
						label="研究科"
						error={getFormErrorMessage("graduateSchool")}
						placeholder="理工学研究科"
						{...register("graduateSchool", {
							setValueAs: (value) => value || undefined,
						})}
					/>

					<Form.Field.TextInput
						label="専攻"
						error={getFormErrorMessage("specialization")}
						placeholder="数理電子情報専攻"
						{...register("specialization", {
							setValueAs: (value) => value || undefined,
						})}
					/>
				</>
			)}

			<Form.Field.TextInput
				label="学籍番号"
				error={getFormErrorMessage("studentId")}
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
				error={getFormErrorMessage("academicEmail")}
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
