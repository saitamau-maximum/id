import * as v from "valibot";

export const OAuthSchemas = {
	ApplicationName: v.pipe(
		v.string(),
		v.nonEmpty("アプリケーション名を入力してください"),
		v.minLength(3, "アプリケーション名は3文字以上16文字以下で入力してください"),
		v.maxLength(
			16,
			"アプリケーション名は3文字以上16文字以下で入力してください",
		),
	),
	Description: v.pipe(
		v.string(),
		v.maxLength(255, "説明は255文字以下で入力してください"),
	),
};
