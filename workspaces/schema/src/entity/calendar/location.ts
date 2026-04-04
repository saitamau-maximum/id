import * as v from "valibot";
import { MaxLines } from "../../common/max-lines";

export const LOCATION_NAME_MAX_LENGTH = 64; // 場所名は64文字まで許容
export const LOCATION_DESCRIPTION_MAX_LENGTH = 255; // 説明は255文字まで許容
export const LOCATION_DESCRIPTION_MAX_LINES = 10; // 説明は10行まで許容

export const Location = v.object({
	id: v.string(),
	name: v.pipe(
		v.string(),
		v.nonEmpty("場所名を入力してください"),
		v.maxLength(
			LOCATION_NAME_MAX_LENGTH,
			"場所名は64文字以下で入力してください",
		),
	),
	description: v.pipe(
		v.string(),
		v.nonEmpty("説明を入力してください"),
		v.maxLength(
			LOCATION_DESCRIPTION_MAX_LENGTH,
			"説明は255文字以下で入力してください",
		),
		MaxLines(
			LOCATION_DESCRIPTION_MAX_LINES,
			"説明は10行以下で入力してください",
		),
	),
	createdAt: v.date(),
});
export type Location = v.InferOutput<typeof Location>;
