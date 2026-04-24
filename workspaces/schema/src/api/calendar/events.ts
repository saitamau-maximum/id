import * as v from "valibot";
import { Event, EventWithNotify } from "../../entity/calendar/event";

export const CreateEventParams = v.pipe(
	v.omit(EventWithNotify, ["id", "userId"]),
	v.forward(
		v.partialCheck(
			[["startAt"], ["endAt"]],
			({ startAt, endAt }) => startAt < endAt,
			"終了日時は開始日時よりも後にしてください",
		),
		["endAt"],
	),
);
export type CreateEventParams = v.InferOutput<typeof CreateEventParams>;

export const UpdateEventParams = v.pipe(
	v.omit(EventWithNotify, ["id", "userId"]),
	v.forward(
		v.partialCheck(
			[["startAt"], ["endAt"]],
			({ startAt, endAt }) => startAt < endAt,
			"終了日時は開始日時よりも後にしてください",
		),
		["endAt"],
	),
);
export type UpdateEventParams = v.InferOutput<typeof UpdateEventParams>;

export const GetEventsResponse = v.array(Event);
export type GetEventsResponse = v.InferOutput<typeof GetEventsResponse>;
