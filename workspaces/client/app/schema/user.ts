import * as v from "valibot";
import { RESERVED_WORDS } from "~/constant";
import { MaxLines } from "~/utils/valibot";

// 本名を表す文字列において、苗字、名前、ミドルネーム等が1つ以上の空文字で区切られている場合に受理される
const realNamePattern = /^(?=.*\S(?:[\s　]+)\S).+$/;

export const BIO_MAX_LENGTH = 255; // Bioは255文字まで許容
export const BIO_MAX_LINES = 10; // Bioは10行まで許容

export const UserSchemas = {
	DisplayId: v.pipe(
		v.string(),
		v.nonEmpty("表示IDを入力してください"),
		v.minLength(3, "表示IDは3文字以上16文字以下で入力してください"),
		v.maxLength(16, "表示IDは3文字以上16文字以下で入力してください"),
		v.check(
			(value) => !RESERVED_WORDS.includes(value),
			"この表示IDは使用できません",
		),
		v.check((value) => !value.match(/^_+$/), "この表示IDは使用できません"),
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
		v.string(),
		v.regex(
			realNamePattern,
			"苗字、名前、ミドルネーム等はスペースで区切って入力してください",
		),
		v.nonEmpty("本名を入力してください"),
		v.maxLength(16, "本名は16文字以下で入力してください"),
	),
	RealNameKana: v.pipe(
		v.string(),
		v.regex(
			realNamePattern,
			"苗字、名前、ミドルネーム等はスペースで区切って入力してください",
		),
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
	Bio: v.pipe(
		v.string(),
		v.maxLength(
			BIO_MAX_LENGTH,
			`自己紹介は${BIO_MAX_LENGTH}文字以下で入力してください`,
		),
		MaxLines(
			BIO_MAX_LINES,
			`自己紹介は${BIO_MAX_LINES}行以下で入力してください`,
		),
	),
	SocialLinks: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.url("URLの形式が正しくありません"),
			),
		),
		v.nonEmpty("SNSリンクを入力してください"),
	)
};
