import { valibotResolver } from "@hookform/resolvers/valibot";
import { UserProfileUpdateParams } from "@idp/schema/api/user";
import { BIO_MAX_LENGTH, BIO_MAX_LINES } from "@idp/schema/entity/user";
import { Fragment, type ReactNode, useCallback, useState } from "react";
import { Plus, X } from "react-feather";
import { useFieldArray, useForm } from "react-hook-form";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { IconButton } from "~/components/ui/icon-button";
import { SocialIcon } from "~/components/ui/social-icon";
import { Switch } from "~/components/ui/switch";
import {
	FACULTY,
	FACULTY_OF_EDUCATION,
	FACULTY_OF_ENGINEERING,
	FACULTY_OF_LIBERAL_ARTS,
	FACULTY_OF_SCIENCE,
	GRADE,
	GRADUATE_GRADE,
	OUTSIDE_GRADE,
} from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { detectSocialService } from "~/utils/social-link";
import { BioPreview } from "./bio-preview";

type FormInputValues = v.InferInput<typeof UserProfileUpdateParams>;
type FormOutputValues = v.InferOutput<typeof UserProfileUpdateParams>;

type ProfileFormBaseProps = {
	onSubmit: (data: FormOutputValues) => void;
	isPending: boolean;
	submitLabel: string;
};

type ProfileFormSettingsProps = ProfileFormBaseProps & {
	mode: "settings";
	certificationSection: ReactNode;
	oauthSection: ReactNode;
};

type ProfileFormOnboardingProps = ProfileFormBaseProps & {
	mode: "onboarding";
};

export type ProfileFormOutputValues = FormOutputValues;

export type ProfileFormProps =
	| ProfileFormSettingsProps
	| ProfileFormOnboardingProps;

export const ProfileForm = (props: ProfileFormProps) => {
	const { mode, onSubmit, isPending, submitLabel } = props;
	const isOnboarding = mode === "onboarding";
	const certificationSection =
		mode === "settings" ? props.certificationSection : null;
	const oauthSection = mode === "settings" ? props.oauthSection : null;

	const { user } = useAuth();
	const [isPreview, setIsPreview] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
	} = useForm<FormInputValues, unknown, FormOutputValues>({
		resolver: valibotResolver(UserProfileUpdateParams),
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
			bio: user?.bio,
			socialLinks: user?.socialLinks?.map((link) => ({ value: link })) ?? [],
		},
	});

	const {
		fields: socialLinks,
		append: appendSocialLink,
		remove: removeSocialLink,
	} = useFieldArray({
		control,
		name: "socialLinks",
	});

	const bio = watch("bio");
	const bioLength = bio?.length || 0;

	const isOutsideMember = OUTSIDE_GRADE.includes(watch("grade"));
	const isGraduateStudent = GRADUATE_GRADE.includes(watch("grade"));
	const selectedFaculty = watch("faculty");

	const handleFormSubmit = useCallback(
		(data: FormOutputValues) => {
			onSubmit(data);
		},
		[onSubmit],
	);

	const departmentsByFaculty: Record<string, string[]> = {
		教養学部: FACULTY_OF_LIBERAL_ARTS[0]?.identifier ?? [],
		経済学部: [],
		教育学部: FACULTY_OF_EDUCATION[0]?.identifier ?? [],
		理学部: FACULTY_OF_SCIENCE[0]?.identifier ?? [],
		工学部: FACULTY_OF_ENGINEERING[0]?.identifier ?? [],
	};

	return (
		<form
			onSubmit={handleSubmit(handleFormSubmit)}
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

			{isOnboarding && (
				<>
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
				</>
			)}

			{/* 所属情報: B1-B4は学部・学科、M, D以上は研究室必須 */}
			{!isOutsideMember && !isGraduateStudent && (
				<Form.FieldSet>
					<div
						className={css({
							display: "grid",
							gap: "token(spacing.2) token(spacing.4)",
							gridTemplateColumns: "auto 1fr",
							alignItems: "start",
							mdDown: {
								gridTemplateColumns: "1fr !important",
							},
						})}
					>
						<Form.LabelText>学部</Form.LabelText>
						<div>
							<Form.RadioGroup>
								{FACULTY[0].identifier.map((identifier) => (
									<Form.Radio
										key={identifier}
										value={identifier}
										label={identifier}
										required
										{...register("faculty")}
									/>
								))}
							</Form.RadioGroup>
						</div>
						<ErrorDisplay error={errors.faculty?.message} />

						{selectedFaculty &&
							selectedFaculty !== "経済学部" &&
							(departmentsByFaculty[selectedFaculty] ?? []).length > 0 && (
								<Fragment>
									<Form.LabelText>学科</Form.LabelText>
									<div>
										<Form.RadioGroup>
											{(departmentsByFaculty[selectedFaculty] ?? []).map(
												(dept) => (
													<Form.Radio
														key={dept}
														value={dept}
														label={dept}
														required
														{...register("department")}
													/>
												),
											)}
										</Form.RadioGroup>
									</div>
									<ErrorDisplay error={errors.department?.message} />
								</Fragment>
							)}
					</div>

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
				</Form.FieldSet>
			)}

			{/* M, D以上は学部・学科・研究室・研究科・専攻・学籍番号・大学メール必須 */}
			{isGraduateStudent && (
				<Form.FieldSet>
					<div
						className={css({
							display: "grid",
							gap: "token(spacing.2) token(spacing.4)",
							gridTemplateColumns: "auto 1fr",
							alignItems: "start",
							mdDown: {
								gridTemplateColumns: "1fr !important",
							},
						})}
					>
						<Form.LabelText>学部</Form.LabelText>
						<div>
							<Form.RadioGroup>
								{FACULTY[0].identifier.map((identifier) => (
									<Form.Radio
										key={identifier}
										value={identifier}
										label={identifier}
										required
										{...register("faculty")}
									/>
								))}
							</Form.RadioGroup>
							<ErrorDisplay error={errors.faculty?.message} />
						</div>

						{selectedFaculty &&
							selectedFaculty !== "経済学部" &&
							(departmentsByFaculty[selectedFaculty] ?? []).length > 0 && (
								<Fragment>
									<Form.LabelText>学科</Form.LabelText>
									<div>
										<Form.RadioGroup>
											{(departmentsByFaculty[selectedFaculty] ?? []).map(
												(dept) => (
													<Form.Radio
														key={dept}
														value={dept}
														label={dept}
														required
														{...register("department")}
													/>
												),
											)}
										</Form.RadioGroup>
										<ErrorDisplay error={errors.department?.message} />
									</div>
								</Fragment>
							)}
					</div>

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
						placeholder="理工学研究科"
						required
						{...register("graduateSchool", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="専攻"
						error={errors.specialization?.message}
						placeholder="数理電子情報専攻"
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
				</Form.FieldSet>
			)}

			<Form.Field.TextInput
				label={`${isOutsideMember ? "" : "大学以外で"}連絡の取れるメールアドレス`}
				error={errors.email?.message}
				placeholder="member@maximum.vc"
				required
				{...register("email")}
			/>

			{!isOnboarding && (
				<>
					{certificationSection}

					<Form.FieldSet>
						<div
							className={css({
								display: "flex",
								justifyContent: "space-between",
							})}
						>
							<Form.LabelText>自己紹介（10行以内）</Form.LabelText>
							<ErrorDisplay error={errors.bio?.message} />
						</div>
						<Switch.List>
							<Switch.Item
								isActive={!isPreview}
								onClick={() => setIsPreview(!isPreview)}
							>
								Edit
							</Switch.Item>
							<Switch.Item
								isActive={isPreview}
								onClick={() => setIsPreview(!isPreview)}
							>
								Preview
							</Switch.Item>
						</Switch.List>
						{isPreview ? (
							<BioPreview bio={bio} />
						) : (
							<div className={css({ height: "240px" })}>
								<Form.Textarea
									placeholder={`自己紹介を${BIO_MAX_LENGTH}文字以内で入力してください（Markdown使用可能）`}
									rows={BIO_MAX_LINES}
									{...register("bio")}
								/>
							</div>
						)}
						<p
							className={css({
								display: "block",
								fontSize: "sm",
								color: "gray.600",
								textAlign: "right",
							})}
						>
							{bioLength} / {BIO_MAX_LENGTH}
						</p>
					</Form.FieldSet>

					{oauthSection}

					<Form.FieldSet>
						<legend>
							<Form.LabelText>ソーシャルリンク (最大5つ)</Form.LabelText>
						</legend>
						<ul
							className={css({
								display: "flex",
								flexDirection: "column",
								gap: 2,
								marginTop: 2,
							})}
						>
							{socialLinks.map((field, index) => (
								<li className={css({ listStyle: "none" })} key={field.id}>
									<ErrorDisplay error={errors.socialLinks?.[index]?.message} />
									<div
										className={css({
											display: "flex",
											gap: 4,
											placeItems: "center",
										})}
									>
										<SocialIcon
											service={detectSocialService(
												watch(`socialLinks.${index}.value` || ""),
											)}
											size={24}
										/>
										<Form.Input
											placeholder="https://example.com"
											{...register(`socialLinks.${index}.value`)}
										/>
										<IconButton
											label="Remove social link"
											onClick={() => removeSocialLink(index)}
										>
											<X size={16} />
										</IconButton>
									</div>
								</li>
							))}
							<button
								type="button"
								onClick={() => appendSocialLink({ value: "" })}
								disabled={socialLinks.length >= 5}
							>
								<ButtonLike
									variant="text"
									size="sm"
									disabled={socialLinks.length >= 5}
								>
									<Plus size={16} />
									Add
								</ButtonLike>
							</button>
						</ul>
					</Form.FieldSet>
				</>
			)}

			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					{submitLabel}
				</ButtonLike>
			</button>
		</form>
	);
};
