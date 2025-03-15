import { valibotResolver } from "@hookform/resolvers/valibot";
import { Fragment, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { Switch } from "~/components/ui/switch";
import { BIO_MAX_LENGTH, GRADE } from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { UserSchemas } from "~/schema/user";
import type { UserCertification } from "~/types/certification";
import {
	useCertifications,
	useDeleteUserCertification,
} from "../hooks/use-certifications";
import { useSendCertificationRequest } from "../hooks/use-send-certification-request";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { BioPreview } from "./bio-preview";
import { CertificationRequest } from "./certification-request";

const UpdateFormSchema = v.object({
	displayName: UserSchemas.DisplayName,
	realName: UserSchemas.RealName,
	realNameKana: UserSchemas.RealNameKana,
	displayId: UserSchemas.DisplayId,
	email: UserSchemas.Email,
	academicEmail: UserSchemas.AcademicEmail,
	studentId: UserSchemas.StudentId,
	grade: UserSchemas.Grade,
	bio: UserSchemas.Bio,
});

type FormValues = v.InferInput<typeof UpdateFormSchema>;

export const ProfileUpdateForm = () => {
	const { mutate, isPending } = useUpdateProfile();
	const { mutate: sendCertificationRequest } = useSendCertificationRequest();
	const { user } = useAuth();
	const [isPreview, setIsPreview] = useState(false);
	const { data: certifications } = useCertifications();
	const { mutate: deleteCertification, isPending: isPendingDeletion } =
		useDeleteUserCertification();

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
		formState: { errors },
	} = useForm<FormValues>({
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
			bio: user?.bio,
		},
	});

	const bio = watch("bio");
	const bioLength = bio?.length || 0;

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

			<Form.FieldSet>
				<legend>
					<Form.LabelText>資格・試験</Form.LabelText>
				</legend>
				<CertificationCard
					certifications={user?.certifications ?? []}
					onClick={handleCertDelete}
				/>
				<button
					type="button"
					onClick={handleCertRequest}
					disabled={requestableCertifications.length === 0}
				>
					<ButtonLike disabled={requestableCertifications.length === 0}>
						資格・試験の情報を申請する
					</ButtonLike>
				</button>
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
							rows={10}
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

			<button type="submit" disabled={isPending}>
				<ButtonLike variant="primary" disabled={isPending}>
					更新
				</ButtonLike>
			</button>
		</form>
	);
};
