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
			v.integer(),
			v.minValue(1),
		),
	),
	ExpiresAt: v.nullable(
		v.pipe(
			v.string(),
			v.transform((v) => new Date(v)),
			v.date(),
		),
	),
};
