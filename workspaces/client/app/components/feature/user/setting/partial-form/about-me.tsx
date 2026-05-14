import { BIO_MAX_LENGTH, BIO_MAX_LINES } from "@idp/schema/entity/user";
import { useFormContext } from "react-hook-form";
import { css } from "styled-system/css";
import { Form } from "~/components/ui/form";
import { ErrorDisplay } from "~/components/ui/form/error-display";
import { PreviewableField } from "~/components/ui/form/previewable-field";
import { ProfileImageEditor } from "../profile-image-editor";
import type {
	ChildFormProps,
	FormInputValues,
	FormOutputValues,
} from "../types";

export const UserSettingFormAboutMe = ({
	isOnboarding,
	getFormErrorMessage,
}: ChildFormProps) => {
	const { register } = useFormContext<
		FormInputValues,
		unknown,
		FormOutputValues
	>();

	const cannotChangeIndicator = isOnboarding
		? "後から変更できません。"
		: "変更したい場合は Admin に連絡してください。";

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				gap: 8,
				display: "flex",
				lgDown: {
					flexDirection: "column",
				},
			})}
		>
			{!isOnboarding && <ProfileImageEditor />}
			<div
				className={css({
					width: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 6,
					alignItems: "center",
				})}
			>
				<Form.Field.TextInput
					label="ID"
					error={getFormErrorMessage("displayId")}
					placeholder="maximum_taro"
					additionalInfo={`
					半角英小文字、半角数字、アンダースコア (_) を使用できます。
					3 文字以上 16 文字以下で入力してください。
					${cannotChangeIndicator}
				`}
					required
					readOnly={!isOnboarding}
					{...register("displayId")}
				/>

				<Form.Field.TextInput
					label="ユーザー名"
					error={getFormErrorMessage("displayName")}
					placeholder="Maximum"
					required
					{...register("displayName")}
				/>

				<Form.Field.TextInput
					label="氏名 (漢字 or カタカナ)"
					error={getFormErrorMessage("realName")}
					placeholder="山田 太郎"
					additionalInfo={`
					大学に届け出る書類に必要となるため、学生証に記載の通りに入力してください。
					名字・名前はスペースで区切ってください。
					${cannotChangeIndicator}
				`}
					required
					readOnly={!isOnboarding}
					{...register("realName")}
				/>

				<Form.Field.TextInput
					label="氏名 (カナ)"
					error={getFormErrorMessage("realNameKana")}
					additionalInfo={`
					名字・名前はスペースで区切ってください。
					${cannotChangeIndicator}
				`}
					placeholder="ヤマダ タロウ"
					required
					readOnly={!isOnboarding}
					{...register("realNameKana")}
				/>

				<Form.FieldSet>
					<Form.LabelText>自己紹介</Form.LabelText>
					<PreviewableField<FormInputValues>
						name="bio"
						placeholder={`
						こんにちは！ ○○ が好きです！ △△ に興味があって Maximum に入りました！ ...など、自由に書いてください！

						[リンク](https://example.com) や **太字**、*斜体*、 \`inline code\` などが使えます。
					`
							.replaceAll("\t", "")
							.trim()}
						maxLines={BIO_MAX_LINES}
						maxLength={BIO_MAX_LENGTH}
					/>
					<p
						className={css({
							fontSize: "sm",
							color: "gray.500",
						})}
					>
						自己紹介はプロフィールページに表示されます。 最大 {BIO_MAX_LENGTH}{" "}
						文字、 {BIO_MAX_LINES} 行まで入力できます。 Markdown
						形式で記述できます。
					</p>
					<ErrorDisplay error={getFormErrorMessage("bio")} />
				</Form.FieldSet>
			</div>
		</div>
	);
};
