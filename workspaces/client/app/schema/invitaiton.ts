import * as v from "valibot";

export const InvitationURLSchemas = {
	Title: v.pipe(
		v.string(),
		v.nonEmpty("タイトルを入力してください"),
		v.maxLength(64, "タイトルは64文字以下で入力してください"),
	),
	RemainingUse: v.nullable(
		v.pipe(
			v.string(),
			v.transform((v) => Number.parseInt(v)),
			v.integer("使用可能回数は整数で入力してください"),
			v.minValue(1, "使用可能回数は1以上で入力してください"),
		),
	),
	ExpiresAt: v.nullable(
		v.pipe(
			v.string(),
			v.transform((v) => new Date(v)),
			v.date("有効期限は日付で入力してください"),
			v.custom(
				(v) => typeof v === "object" && v instanceof Date && v > new Date(),
				"有効期限は未来の日付で入力してください",
			),
		),
	),
};
