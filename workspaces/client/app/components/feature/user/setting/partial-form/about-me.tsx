import { useFormContext } from "react-hook-form";
import { Form } from "~/components/ui/form";
import type {
	ChildFormProps,
	FormInputValues,
	FormOutputValues,
} from "../types";

export const UserSettingFormAboutMe = ({ isOnboarding }: ChildFormProps) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<FormInputValues, unknown, FormOutputValues>();

	const cannotChangeIndicator = isOnboarding
		? "後から変更できません。"
		: "変更するには Admin に連絡してください。";

	return (
		<>
			<Form.Field.TextInput
				label="ID"
				error={errors.displayId?.message}
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
				error={errors.displayName?.message}
				placeholder="Maximum"
				required
				{...register("displayName")}
			/>

			<Form.Field.TextInput
				label="氏名 (漢字 or カタカナ)"
				error={errors.realName?.message}
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
				error={errors.realNameKana?.message}
				additionalInfo={`
					名字・名前はスペースで区切ってください。
					${cannotChangeIndicator}
				`}
				placeholder="ヤマダ タロウ"
				required
				readOnly={!isOnboarding}
				{...register("realNameKana")}
			/>
		</>
	);
};
