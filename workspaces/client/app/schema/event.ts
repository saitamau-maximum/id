import * as v from "valibot";
import { MaxLines } from "~/utils/valibot";

export const EVENT_DESCRIPTION_MAX_LENGTH = 255; // 説明は255文字まで許容
export const EVENT_DESCRIPTION_MAX_LINES = 10; // 説明は10行まで許容

export const EventSchemas = {
	Title: v.pipe(
		v.string(),
		v.nonEmpty("タイトルを入力してください"),
		v.maxLength(64, "タイトルは64文字以下で入力してください"),
	),
	Description: v.pipe(
		v.string(),
		v.nonEmpty("説明を入力してください"),
		v.maxLength(
			EVENT_DESCRIPTION_MAX_LENGTH,
			"説明は255文字以下で入力してください",
		),
		MaxLines(EVENT_DESCRIPTION_MAX_LINES, "説明は10行以下で入力してください"),
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
	LocationId: v.nullable(v.string()),
};
