import { valibotResolver } from "@hookform/resolvers/valibot";
import { UserProfileUpdateParams } from "@idp/schema/api/user";
import { DEPARTMENT_BY_ID } from "@idp/schema/entity/department";
import { FACULTY_BY_ID, FACULTY_IDS } from "@idp/schema/entity/faculty";
import {
	GRADE_BY_ID,
	type GradeId,
	isGraduateGrade,
	isOutsideGrade,
} from "@idp/schema/entity/grade";
import { BIO_MAX_LENGTH, BIO_MAX_LINES } from "@idp/schema/entity/user";
import { Fragment, type ReactElement, useEffect } from "react";
import { Plus, X } from "react-feather";
import { useFieldArray, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import type * as v from "valibot";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { PreviewableField } from "~/components/ui/form/previewable-field";
import { IconButton } from "~/components/ui/icon-button";
import { SocialIcon } from "~/components/ui/social-icon";
import { Tab } from "~/components/ui/tab";
import { GRADE_CATEGORIES } from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { detectSocialService } from "~/utils/social-link";
import { UserSettingCertificationRequest } from "./certification-request";
import { UserSettingFormAcademic } from "./form-academic";
import { UserSettingFormCertification } from "./form-certification";
import { UserSettingFormContact } from "./form-contact";
import { UserSettingFormMe } from "./form-me";
import { UserSettingFormOAuth } from "./form-oauth";
import { UserSettingOAuthConnect } from "./oauth-connect";

type FormInputValues = v.InferInput<typeof UserProfileUpdateParams>;
type FormOutputValues = v.InferOutput<typeof UserProfileUpdateParams>;

interface Props {
	type: "onboarding" | "update";
	isPending: boolean;
	onSubmit: (data: FormOutputValues) => void;
}

const settingsTabs = [
	{
		label: "自分の情報",
		hash: "#me",
		component: UserSettingFormMe,
		displayInOnboarding: true,
	},
	{
		label: "連絡先",
		hash: "#contact",
		component: UserSettingFormContact,
		displayInOnboarding: true,
	},
	{
		label: "学籍情報",
		hash: "#academic",
		component: UserSettingFormAcademic,
		displayInOnboarding: true,
	},
	{
		label: "資格・試験",
		hash: "#certification",
		component: UserSettingFormCertification,
		displayInOnboarding: false,
	},
	{
		label: "OAuth 連携",
		hash: "#oauth",
		component: UserSettingFormOAuth,
		displayInOnboarding: false,
	},
] satisfies {
	label: string;
	hash: string;
	component: () => ReactElement;
	displayInOnboarding: boolean;
}[];

export const UserSettingForm = ({ type, isPending, onSubmit }: Props) => {
	const isOnboarding = type === "onboarding";
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (location.hash === "") navigate("#me");
	}, [navigate, location.hash]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		control,
		formState: { errors },
	} = useForm<FormInputValues, unknown, FormOutputValues>({
		resolver: valibotResolver(UserProfileUpdateParams),
		defaultValues: {
			// onboarding の場合 socialLinks, bio は使わないが、セットしても問題ないのでセットしてしまう
			displayName: user?.displayName,
			realName: user?.realName,
			realNameKana: user?.realNameKana,
			displayId: user?.displayId,
			email: user?.email,
			academicEmail: user?.academicEmail,
			studentId: user?.studentId,
			grade: user?.grade?.toString(),
			faculty: user?.faculty?.toString(),
			department: user?.department?.toString(),
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
			<Tab.List>
				{settingsTabs.map((tab) => {
					if (isOnboarding && !tab.displayInOnboarding) return null;
					return (
						<Tab.Item
							key={tab.hash}
							to={tab.hash}
							isActive={(location) => location.hash === tab.hash}
						>
							{tab.label}
						</Tab.Item>
					);
				})}
			</Tab.List>

			{settingsTabs.map((tab) => {
				if (isOnboarding && !tab.displayInOnboarding) return null;
				if (location.hash !== tab.hash) return null;
				const Component = tab.component;
				return (
					<div key={tab.hash}>
						<Component />
					</div>
				);
			})}

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

				{isOnboarding && (
					<Form.Field.TextInput
						label="ID (半角英小文字、半角数字、アンダースコア(_)で3文字以上16文字以下)"
						error={errors.displayId?.message}
						placeholder="maximum_taro"
						required
						{...register("displayId")}
					/>
				)}

				{isOnboarding && (
					<Form.Field.TextInput
						label="ユーザー名"
						error={errors.displayName?.message}
						placeholder="Maximum"
						required
						{...register("displayName")}
					/>
				)}

				{isOnboarding && (
					<Form.Field.TextInput
						label={`本名 ${isOutsideMember ? "" : "(学生証に記載のもの)"}`}
						error={errors.realName?.message}
						placeholder="山田 太郎"
						required
						{...register("realName")}
					/>
				)}

				{isOnboarding && (
					<Form.Field.TextInput
						label="本名 (カナ)"
						error={errors.realNameKana?.message}
						placeholder="ヤマダ タロウ"
						required
						{...register("realNameKana")}
					/>
				)}

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
						</div>
						<ErrorDisplay error={errors.faculty?.message} />

						<Form.LabelText>学科</Form.LabelText>
						<div>
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
						</div>
						<ErrorDisplay error={errors.department?.message} />
					</div>

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

					{!isOutsideMember && (
						<>
							<Form.Field.TextInput
								label="学籍番号"
								error={errors.studentId?.message}
								placeholder="00XX000"
								required
								{...register("studentId", {
									setValueAs: (value) => value || undefined,
								})}
							/>

							<Form.Field.TextInput
								label="大学のメールアドレス"
								error={errors.academicEmail?.message}
								placeholder="student@ms.saitama-u.ac.jp"
								required
								type="email"
								{...register("academicEmail", {
									setValueAs: (value) => value || undefined,
								})}
							/>
						</>
					)}
				</Form.FieldSet>

				<Form.Field.TextInput
					label={`${isOutsideMember ? "" : "大学以外で"}連絡の取れるメールアドレス`}
					error={errors.email?.message}
					placeholder="member@maximum.vc"
					required
					{...register("email")}
				/>

				{!isOnboarding && <UserSettingCertificationRequest />}

				{!isOnboarding && (
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
						<PreviewableField
							register={register}
							watch={watch}
							name="bio"
							placeholder={`自己紹介を${BIO_MAX_LENGTH}文字以内で入力してください（Markdown使用可能）`}
							maxLines={BIO_MAX_LINES}
							maxLength={BIO_MAX_LENGTH}
						/>
					</Form.FieldSet>
				)}

				{!isOnboarding && <UserSettingOAuthConnect />}

				{!isOnboarding && (
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
												watch(`socialLinks.${index}.value`) ?? "",
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
				)}

				<button type="submit" disabled={isPending}>
					<ButtonLike variant="primary" disabled={isPending}>
						{isOnboarding ? "はじめる" : "更新"}
					</ButtonLike>
				</button>
			</form>
		</>
	);
};
