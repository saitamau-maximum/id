import * as v from "valibot";
import { BIO_MAX_LENGTH } from "~/constant";

export const EventSchemas = {
	Title: v.pipe(v.string(), v.nonEmpty("タイトルを入力してください")),
	Description: v.pipe(
		v.string(),
		v.maxLength(
			BIO_MAX_LENGTH,
			`説明は${BIO_MAX_LENGTH}文字以下で入力してください`,
		),
	),
	StartAt: v.pipe(
		v.string(),
		v.transform((v) => new Date(v)),
		v.date(),
	),
	EndAt: v.pipe(
		v.string(),
		v.transform((v) => new Date(v)),
		v.date(),
	),
};
