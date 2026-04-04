import * as v from "valibot";
import { Location } from "../../entity/calendar/location";

export const CalendarLocationCreateParams = v.pick(Location, [
	"name",
	"description",
]);
export type CalendarLocationCreateParams = v.InferInput<
	typeof CalendarLocationCreateParams
>;

export const CalendarLocationUpdateParams = v.pick(Location, [
	"id",
	"name",
	"description",
]);
export type CalendarLocationUpdateParams = v.InferInput<
	typeof CalendarLocationUpdateParams
>;

export const CalendarLocationGetLocationsResponse = v.array(
	v.omit(Location, ["description"]),
);
export type CalendarLocationGetLocationsResponse = v.InferOutput<
	typeof CalendarLocationGetLocationsResponse
>;
