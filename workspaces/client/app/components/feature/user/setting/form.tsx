import { valibotResolver } from "@hookform/resolvers/valibot";
import { UserProfileUpdateParams } from "@idp/schema/api/user";
// import { DEPARTMENT_BY_ID } from "@idp/schema/entity/department";
// import { FACULTY_BY_ID, FACULTY_IDS } from "@idp/schema/entity/faculty";
// import {
// 	GRADE_BY_ID,
// 	type GradeId,
// 	isGraduateGrade,
// 	isOutsideGrade,
// } from "@idp/schema/entity/grade";
// import { BIO_MAX_LENGTH, BIO_MAX_LINES } from "@idp/schema/entity/user";
// import { Fragment, type ReactElement, useEffect } from "react";
import { type ReactElement, useEffect } from "react";
// import { Plus, X } from "react-feather";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
// import { Form } from "~/components/ui/form";
// import { ErrorDisplay } from "~/components/ui/form/error-display";
// import { PreviewableField } from "~/components/ui/form/previewable-field";
// import { IconButton } from "~/components/ui/icon-button";
// import { SocialIcon } from "~/components/ui/social-icon";
import { Tab } from "~/components/ui/tab";
// import { GRADE_CATEGORIES } from "~/constant";
import { useAuth } from "~/hooks/use-auth";
import { UserSettingFormAboutMe } from "./partial-form/about-me";
// import { detectSocialService } from "~/utils/social-link";
// import { UserSettingCertificationRequest } from "./certification-request";
import { UserSettingFormAcademic } from "./partial-form/academic";
import { UserSettingFormCertification } from "./partial-form/certification";
import { UserSettingFormContact } from "./partial-form/contact";
import { UserSettingFormOAuth } from "./partial-form/oauth";
import type {
	ChildFormProps,
	FormInputValues,
	FormOutputValues,
} from "./types";

interface Props {
	type: "onboarding" | "update";
	isPending: boolean;
	onSubmit: (data: FormOutputValues) => void;
}

interface SettingsTabItem {
	label: string;
	hash: string;
	component: (props: ChildFormProps) => ReactElement;
	displayInOnboarding: boolean;
	formFields?: (keyof FormInputValues)[];
}

const settingsTabs = [
	{
		label: "自分の情報",
		hash: "#me",
		component: UserSettingFormAboutMe,
		displayInOnboarding: true,
		formFields: ["displayId", "displayName", "realName", "realNameKana", "bio"],
	},
	{
		label: "連絡先",
		hash: "#contact",
		component: UserSettingFormContact,
		displayInOnboarding: true,
		formFields: ["email", "socialLinks"],
	},
	{
		label: "学籍情報",
		hash: "#academic",
		component: UserSettingFormAcademic,
		displayInOnboarding: true,
		formFields: [
			"studentId",
			"grade",
			"faculty",
			"department",
			"laboratory",
			"graduateSchool",
			"specialization",
			"academicEmail",
		],
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
] satisfies SettingsTabItem[];

export const UserSettingForm = ({ type, isPending, onSubmit }: Props) => {
	const isOnboarding = type === "onboarding";
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (location.hash === "") navigate("#me");
	}, [navigate, location.hash]);

	const formMethods = useForm<FormInputValues, unknown, FormOutputValues>({
		resolver: valibotResolver(UserProfileUpdateParams),
		mode: "onChange",
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

	const canSubmit = formMethods.formState.isValid && !isPending;

	// mount 時に validation を走らせて、タブに「残り ○ 個」表示をする
	// ただし、フォームがエラーで真っ赤になっちゃうので、子フォームで touchedFields を見てエラー表示するかどうかを判断する
	useEffect(() => {
		formMethods.trigger();
	}, [formMethods]);

	const getFormErrorMessage = (field: keyof FormInputValues) => {
		const { errors, touchedFields, dirtyFields } = formMethods.formState;
		// もしエラーがあって、 フォームが変更された OR ユーザーが触った OR 値がある場合はエラーを表示する
		if (errors[field]) {
			if (
				dirtyFields[field] ||
				touchedFields[field] ||
				formMethods.watch(field)
			) {
				return errors[field]?.message;
			}
		}
		return undefined;
	};

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
							notification={tab.formFields?.reduce((numError, field) => {
								// エラーのあるフィールドの数をカウントして表示する
								return numError + (formMethods.formState.errors[field] ? 1 : 0);
							}, 0)}
						>
							{tab.label}
						</Tab.Item>
					);
				})}
			</Tab.List>

			<FormProvider {...formMethods}>
				<form
					onSubmit={formMethods.handleSubmit(onSubmit)}
					className={css({
						width: "100%",
						display: "flex",
						flexDirection: "column",
						gap: 6,
						alignItems: "center",
					})}
				>
					{settingsTabs.map((tab) => {
						if (isOnboarding && !tab.displayInOnboarding) return null;
						if (location.hash !== tab.hash) return null;
						const Component = tab.component;
						return (
							<Component
								key={tab.hash}
								isOnboarding={isOnboarding}
								getFormErrorMessage={getFormErrorMessage}
							/>
						);
					})}

					<hr
						className={css({
							width: "100%",
							borderColor: "gray.300",
						})}
					/>

					<button type="submit" disabled={!canSubmit}>
						<ButtonLike variant="primary" disabled={!canSubmit}>
							{isOnboarding ? "はじめる" : "更新"}
						</ButtonLike>
					</button>
					<p
						className={css({
							fontSize: "sm",
							color: "gray.500",
						})}
					>
						{settingsTabs
							// 資格試験・OAuth は関係ないので除外
							.filter((tab) => tab.displayInOnboarding)
							.map((tab) => `「${tab.label}」`)
							.join("")}
						のすべての入力内容にエラーがない場合に、ボタンが有効になります。
					</p>
				</form>
			</FormProvider>
		</>
	);
};
