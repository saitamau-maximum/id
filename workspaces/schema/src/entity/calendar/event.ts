import * as v from "valibot";
import { MaxLines } from "../../common/max-lines";
import { Location } from "./location";

export const EVENT_TITLE_MAX_LENGTH = 64; // タイトルは64文字まで許容
export const EVENT_DESCRIPTION_MAX_LENGTH = 255; // 説明は255文字まで許容
export const EVENT_DESCRIPTION_MAX_LINES = 10; // 説明は10行まで許容

export const Event = v.pipe(
	v.object({
		id: v.string(),
		userId: v.string(),
		title: v.pipe(
			v.string(),
			v.nonEmpty("タイトルを入力してください"),
			v.maxLength(
				EVENT_TITLE_MAX_LENGTH,
				`タイトルは${EVENT_TITLE_MAX_LENGTH}文字以下で入力してください`,
			),
		),
		description: v.optional(
			v.pipe(
				v.string(),
				v.maxLength(
					EVENT_DESCRIPTION_MAX_LENGTH,
					`説明は${EVENT_DESCRIPTION_MAX_LENGTH}文字以下で入力してください`,
				),
				MaxLines(
					EVENT_DESCRIPTION_MAX_LINES,
					`説明は${EVENT_DESCRIPTION_MAX_LINES}行以下で入力してください`,
				),
			),
		),
		startAt: v.date(),
		endAt: v.date(),
		locationId: v.optional(Location.entries.id),
	}),
	v.forward(
		v.check(
			({ startAt, endAt }) => startAt < endAt,
			"終了日時は開始日時よりも後にしてください",
		),
		["endAt"],
	),
);
export type Event = v.InferOutput<typeof Event>;

export const EventWithNotify = v.intersect([
	Event,
	v.object({
		notifyDiscord: v.boolean(),
	}),
]);
export type EventWithNotify = v.InferOutput<typeof EventWithNotify>;

export const EventWithLocation = v.intersect([
	Event,
	v.object({
		location: v.optional(v.omit(Location, ["createdAt"])),
	}),
]);
export type EventWithLocation = v.InferOutput<typeof EventWithLocation>;
