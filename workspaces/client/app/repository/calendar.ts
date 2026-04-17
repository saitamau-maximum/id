import type {
	CreateEventParams,
	GetEventsResponse,
	UpdateEventParams,
} from "@idp/schema/api/calendar/events";
import type { Event } from "@idp/schema/entity/calendar/event";
import { toHTMLDateTimePickerFormat } from "~/utils/date";
import { client } from "~/utils/hono";

export interface ICalendarRepository {
	getAllEvents: () => Promise<GetEventsResponse>;
	getAllEvents$$key: () => unknown[];
	createEvent: (event: CreateEventParams) => Promise<void>;
	updateEvent: (
		eventId: Event["id"],
		params: UpdateEventParams,
	) => Promise<void>;
	deleteEvent: (eventId: Event["id"]) => Promise<void>;
	generateURL: () => Promise<string>;
}

export class CalendarRepositoryImpl implements ICalendarRepository {
	async getAllEvents() {
		const res = await client.calendar.events.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch events");
		}
		return (await res.json()).map((event) => ({
			...event,
			startAt: new Date(event.startAt),
			endAt: new Date(event.endAt),
		}));
	}

	getAllEvents$$key() {
		return ["calendar-events"];
	}

	async createEvent(event: CreateEventParams) {
		const res = await client.calendar.events.$post({
			json: {
				...event,
				// schema で isoDateTime を受け付けるようにしているので
				startAt: toHTMLDateTimePickerFormat(event.startAt),
				endAt: toHTMLDateTimePickerFormat(event.endAt),
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create event");
		}
	}

	async updateEvent(eventId: Event["id"], params: UpdateEventParams) {
		const res = await client.calendar.events[":id"].$put({
			param: {
				id: eventId,
			},
			json: {
				...params,
				// schema で isoDateTime を受け付けるようにしているので
				startAt: toHTMLDateTimePickerFormat(params.startAt),
				endAt: toHTMLDateTimePickerFormat(params.endAt),
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update event");
		}
	}

	async deleteEvent(eventId: Event["id"]) {
		const res = await client.calendar.events[":id"].$delete({
			param: {
				id: eventId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete event");
		}
	}

	async generateURL() {
		const res = await client.calendar["generate-url"].$post();
		if (!res.ok) {
			throw new Error("Failed to generate url");
		}
		return res.text();
	}
}
