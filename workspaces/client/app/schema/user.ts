import * as v from "valibot";

export const UserSchemas = {
	DisplayId: v.pipe(
		v.string(),
		v.nonEmpty("表示IDを入力してください"),
		v.regex(
			/^[a-z0-9_]{3,16}$/,
			"表示IDは3文字以上16文字以下の半角英小文字、半角数字、アンダースコア(_)で入力してください。",
		),
	),
	DisplayName: v.pipe(v.string(), v.nonEmpty("ユーザー名を入力してください")),
	RealName: v.pipe(v.string(), v.nonEmpty("本名を入力してください")),
	RealNameKana: v.pipe(v.string(), v.nonEmpty("本名(カナ)を入力してください")),
	Email: v.pipe(
		v.string(),
		v.nonEmpty("メールアドレスを入力してください"),
		v.email("メールアドレスの形式が正しくありません"),
	),
	AcademicEmail: v.pipe(
		v.string(),
		v.nonEmpty("大学のメールアドレスを入力してください"),
		v.email("大学のメールアドレスの形式が正しくありません"),
	),
	StudentId: v.pipe(
		v.string(),
		v.regex(
			/^\d{2}[A-Z]{2}\d{3}$/,
			"学籍番号の形式が正しくありません、半角数字と半角英大文字で00XX000の形式で入力してください。",
		),
	),
	Grade: v.pipe(v.string(), v.nonEmpty("学年を選択してください")),
};
