import * as v from "valibot";

const ValidateName = v.pipe(
	v.string(),
	v.regex(/^[\S ]+$/, "半角スペース以外の空白文字は使用できません"),
	v.includes(" ", "苗字、名前、ミドルネーム等は半角スペースで区切ってください"),
	v.startsWith(" ", "先頭にスペースを使用することはできません"),
	v.endsWith(" ", "末尾にスペースを使用することはできません"),
	v.includes("  "),
);

export const UserSchemas = {
	DisplayId: v.pipe(
		v.string(),
		v.nonEmpty("表示IDを入力してください"),
		v.minLength(3, "表示IDは3文字以上16文字以下で入力してください"),
		v.maxLength(16, "表示IDは3文字以上16文字以下で入力してください"),
		v.regex(
			/^[a-z0-9_]+$/,
			"表示IDは半角英小文字、半角数字、アンダースコア(_)で入力してください",
		),
	),
	DisplayName: v.pipe(
		v.string(),
		v.nonEmpty("ユーザー名を入力してください"),
		v.maxLength(16, "ユーザー名は16文字以下で入力してください"),
	),
	RealName: v.pipe(
		ValidateName,
		v.nonEmpty("本名を入力してください"),
		v.maxLength(16, "本名は16文字以下で入力してください"),
	),
	RealNameKana: v.pipe(
		ValidateName,
		v.nonEmpty("本名(カナ)を入力してください"),
		v.maxLength(16, "本名(カナ)は16文字以下で入力してください"),
	),
	Email: v.pipe(
		v.string(),
		v.nonEmpty("メールアドレスを入力してください"),
		v.email("メールアドレスの形式が正しくありません"),
		v.maxLength(255, "メールアドレスは255文字以下で入力してください"),
	),
	AcademicEmail: v.pipe(
		v.string(),
		v.nonEmpty("大学のメールアドレスを入力してください"),
		v.email("大学のメールアドレスの形式が正しくありません"),
		v.maxLength(255, "大学のメールアドレスは255文字以下で入力してください"),
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
