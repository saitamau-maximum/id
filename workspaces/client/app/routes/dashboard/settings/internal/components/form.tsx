import { valibotResolver } from "@hookform/resolvers/valibot";
import { OAUTH_PROVIDER_IDS } from "@idp/server/shared/oauth";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Plus, X } from "react-feather";
import { useFieldArray, useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { IconButton } from "~/components/ui/icon-button";
import { SocialIcon } from "~/components/ui/social-icon";
import { Switch } from "~/components/ui/switch";
import { Table } from "~/components/ui/table";
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
import { BIO_MAX_LENGTH, BIO_MAX_LINES, UserSchemas } from "~/schema/user";
import type { UserCertification } from "~/types/certification";
import { detectSocialService } from "~/utils/social-link";
import {
	useCertifications,
	useDeleteUserCertification,
} from "../hooks/use-certifications";
import { useSendCertificationRequest } from "../hooks/use-send-certification-request";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { BioPreview } from "./bio-preview";
import { CertificationRequest } from "./certification-request";
import { OAuthConnRow } from "./oauth-conn-row";

const UpdateFormSchema = v.object({
	displayName: UserSchemas.DisplayName,
	realName: UserSchemas.RealName,
	realNameKana: UserSchemas.RealNameKana,
	displayId: UserSchemas.DisplayId,
	email: UserSchemas.Email,
	academicEmail: v.optional(UserSchemas.AcademicEmail),
	studentId: v.optional(UserSchemas.StudentId),
	grade: UserSchemas.Grade,
	faculty: v.optional(v.string()),
	department: v.optional(v.string()),
	laboratory: v.optional(v.string()),
	graduateSchool: v.optional(v.string()),
	specialization: v.optional(v.string()),
	bio: UserSchemas.Bio,
	socialLinks: UserSchemas.SocialLinks,
});

type FormInputValues = v.InferInput<typeof UpdateFormSchema>;
type FormOutputValues = v.InferOutput<typeof UpdateFormSchema>;

export const ProfileUpdateForm = () => {
	const { mutate, isPending } = useUpdateProfile();
	const { mutate: sendCertificationRequest } = useSendCertificationRequest();
	const { user } = useAuth();
	const [isPreview, setIsPreview] = useState(false);
	const { data: certifications } = useCertifications();
	const { mutate: deleteCertification } = useDeleteUserCertification();

	const requestableCertifications = useMemo(() => {
		const requestedIds = user?.certifications.map((c) => c.id) || [];
		return certifications?.filter((c) => !requestedIds.includes(c.id)) || [];
	}, [certifications, user]);

	const handleCertRequest = useCallback(async () => {
		if ((requestableCertifications ?? []).length === 0) return;
		const res = await CertificationRequest.call({
			certifications: requestableCertifications,
		});
		if (res.type === "dismiss") return;
		sendCertificationRequest(res.request);
	}, [requestableCertifications, sendCertificationRequest]);

	const handleCertDelete = useCallback(
		async (certification: UserCertification) => {
			const res = await ConfirmDialog.call({
				title: "資格・試験の削除",
				danger: true,
				children: <DeleteConfirmation title={certification.title} />,
			});
			if (res.type === "dismiss") return;
			deleteCertification(certification.id);
		},
		[deleteCertification],
	);

	const {
		register,
		handleSubmit,
		watch,
		control,
		setError,
		formState: { errors },
	} = useForm<FormInputValues, unknown, FormOutputValues>({
		resolver: valibotResolver(UpdateFormSchema),
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
	const onSubmit = useCallback(
		(data: FormInputValues) => {
			const isOutsideMember = OUTSIDE_GRADE.includes(data.grade);
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
			const socialLinks = data.socialLinks.map((link) => link.value);
			const payload = {
				...data,
				socialLinks,
			};
			mutate(payload);
		},
		[mutate, setError],
	);

	const bio = watch("bio");
	const bioLength = bio?.length || 0;

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
						label="研究室（任意）"
						error={errors.laboratory?.message}
						placeholder="田中研究室"
						{...register("laboratory", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>
				</Form.FieldSet>
			)}

			{/* M, D以上は研究科・専攻・研究室必須 */}
			{isGraduateStudent && (
				<Form.FieldSet>
					<Form.Field.TextInput
						label="研究科"
						error={errors.graduateSchool?.message}
						placeholder="情報理工学研究科"
						{...register("graduateSchool", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>

					<Form.Field.TextInput
						label="専攻"
						error={errors.specialization?.message}
						placeholder="情報理工学専攻"
					/>

					<Form.Field.TextInput
						label="研究室"
						error={errors.laboratory?.message}
						placeholder="田中研究室"
						{...register("laboratory", {
							setValueAs: (value) => (!value ? undefined : value),
						})}
					/>
				</Form.FieldSet>
			)}

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

			{!isOutsideMember && (
				<Form.Field.TextInput
					label="学籍番号"
					error={errors.studentId?.message}
					placeholder="00XX000"
					required
					{...register("studentId", {
						setValueAs: (value) => (!value ? undefined : value),
					})}
				/>
			)}

			{!isOutsideMember && (
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
			)}

			<Form.Field.TextInput
				label={`${isOutsideMember ? "" : "大学以外で"}連絡の取れるメールアドレス`}
				error={errors.email?.message}
				placeholder="member@maximum.vc"
				required
				{...register("email")}
			/>

			<Form.FieldSet>
				<legend>
					<Form.LabelText>資格・試験</Form.LabelText>
				</legend>
				<CertificationCard
					certifications={user?.certifications ?? []}
					onClick={handleCertDelete}
				/>
				{requestableCertifications.length > 0 && (
					<button type="button" onClick={handleCertRequest}>
						<ButtonLike size="sm" variant="secondary">
							<Plus size={16} />
							資格・試験の情報を申請する
						</ButtonLike>
					</button>
				)}
			</Form.FieldSet>

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

			<Form.FieldSet>
				<legend>
					<Form.LabelText>OAuth を使ったログイン</Form.LabelText>
				</legend>

				<Table.Root>
					<Table.Tr>
						<Table.Th>サービス</Table.Th>
						<Table.Th>アカウント</Table.Th>
						<Table.Th>連携</Table.Th>
					</Table.Tr>
					{Object.values(OAUTH_PROVIDER_IDS).map((providerId) => (
						<OAuthConnRow
							key={providerId}
							providerId={providerId}
							conns={user?.oauthConnections ?? []}
						/>
					))}
				</Table.Root>
			</Form.FieldSet>

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
							<ErrorDisplay
								error={errors.socialLinks?.[index]?.value?.message}
							/>
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

			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					更新
				</ButtonLike>
			</button>
		</form>
	);
};
