import * as v from "valibot";
import { MaxLines } from "../common/max-lines";
import { UserCertification } from "./certification";
import { ExportableOAuthConnection } from "./oauth-internal/oauth-connection";
import { Role } from "./role";

const RESERVED_DISPLAY_ID = [
	"maximum",
	"home",
	"calendar",
	"member",
	"members",
	"logout",
	"login",
	"meline",
	"merin",
	"idp",
];

const ACADEMIC_EMAIL_DOMAIN = "ms.saitama-u.ac.jp";

export const BIO_MAX_LENGTH = 255; // Bioは255文字まで許容
export const BIO_MAX_LINES = 10; // Bioは10行まで許容

// 本名を表す文字列において、苗字、名前、ミドルネーム等が1つ以上の空文字で区切られている場合に受理される
const REALNAME_REGEX = /^(?=.*\S(?:[\s　]+)\S).+$/;

/**
 * Userのプロフィール情報
 */
export const UserProfile = v.object({
	displayName: v.pipe(
		v.string(),
		v.nonEmpty("ユーザー名を入力してください"),
		v.maxLength(16, "ユーザー名は16文字以下で入力してください"),
	),
	realName: v.pipe(
		v.string(),
		v.regex(
			REALNAME_REGEX,
			"苗字、名前、ミドルネーム等はスペースで区切って入力してください",
		),
		v.nonEmpty("本名を入力してください"),
	),
	realNameKana: v.pipe(
		v.string(),
		v.regex(
			REALNAME_REGEX,
			"苗字、名前、ミドルネーム等はスペースで区切って入力してください",
		),
		v.nonEmpty("本名を入力してください"),
	),
	displayId: v.pipe(
		v.string(),
		v.nonEmpty("表示IDを入力してください"),
		v.minLength(3, "表示IDは3文字以上16文字以下で入力してください"),
		v.maxLength(16, "表示IDは3文字以上16文字以下で入力してください"),
		v.check(
			(value) => !RESERVED_DISPLAY_ID.includes(value),
			"この表示IDは使用できません",
		),
		v.check((value) => !value.match(/^_+$/), "この表示IDは使用できません"),
		v.regex(
			/^[a-z0-9_]+$/,
			"表示IDは半角英小文字、半角数字、アンダースコア(_)で入力してください",
		),
	),
	profileImageURL: v.pipe(v.string(), v.nonEmpty(), v.url()),
	academicEmail: v.pipe(
		v.string(),
		v.nonEmpty("大学のメールアドレスを入力してください"),
		v.email("大学のメールアドレスの形式が正しくありません"),
		v.maxLength(255, "大学のメールアドレスは255文字以下で入力してください"),
		v.check((value) => {
			const domain = value.split("@")[1];
			return domain === ACADEMIC_EMAIL_DOMAIN;
		}, "大学のメールアドレスを入力してください"),
	),
	email: v.pipe(
		v.string(),
		v.nonEmpty("メールアドレスを入力してください"),
		v.email("メールアドレスの形式が正しくありません"),
		v.maxLength(255, "メールアドレスは255文字以下で入力してください"),
		v.check((value) => {
			const domain = value.split("@")[1];
			return domain !== ACADEMIC_EMAIL_DOMAIN;
		}, "大学以外のメールアドレスを入力してください"),
	),
	studentId: v.pipe(
		v.string(),
		v.regex(
			/^\d{2}[A-Z]{2}\d{3}$/,
			"学籍番号の形式が正しくありません、半角数字と半角英大文字で00XX000の形式で入力してください。",
		),
	),
	grade: v.pipe(v.string(), v.nonEmpty("学年を選択してください")),
	bio: v.pipe(
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
	socialLinks: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.nonEmpty("ソーシャルリンクを入力してください"),
				v.url("URL が正しくありません"),
			),
		),
		v.maxLength(5),
	),
	faculty: v.pipe(
		v.string(),
		v.nonEmpty("学部を入力してください"),
		v.maxLength(32, "学部は32文字以下で入力してください"),
	),
	department: v.pipe(
		v.string(),
		v.nonEmpty("学科を入力してください"),
		v.maxLength(32, "学科は32文字以下で入力してください"),
	),
	laboratory: v.pipe(
		v.string(),
		v.maxLength(16, "研究室は16文字以下で入力してください"),
	),
	graduateSchool: v.pipe(
		v.string(),
		v.maxLength(64, "研究科は64文字以下で入力してください"),
	),
	specialization: v.pipe(
		v.string(),
		v.maxLength(64, "専攻は64文字以下で入力してください"),
	),
	updatedAt: v.date(),
});

export type UserProfile = v.InferOutput<typeof UserProfile>;

/**
 * Userの全ての情報
 *
 * 他会員への公開情報だけでいい場合はMemberを使うこと
 */
export const User = v.object({
	id: v.string(),
	initializedAt: v.nullable(v.date()),
	// 現状は authMiddleware を介しているため招待コードを載せる実装にしてもよいが、
	// 将来的に public API から招待コードが外部に漏洩するリスクを考慮し "仮登録か？" 状態だけ返すようにする
	isProvisional: v.boolean(),
	lastPaymentConfirmedAt: v.nullable(v.date()),
	lastLoginAt: v.optional(v.date()),
	roles: v.array(Role),
	certifications: v.array(UserCertification),
	oauthConnections: v.array(ExportableOAuthConnection),
	...v.partial(UserProfile).entries,
});

export type User = v.InferOutput<typeof User>;

export const DashboardUser = v.pick(User, [
	"id",
	"initializedAt",
	"lastLoginAt",
	"isProvisional",
	"grade",
	"roles",
]);

export type DashboardUser = v.InferOutput<typeof DashboardUser>;
