import type { CalendarEvent } from "~/types/event";
import { client } from "~/utils/hono";

export interface ICalendarRepository {
	getAllEvents: () => Promise<CalendarEvent[]>;
	getAllEvents$$key: () => unknown[];
	createEvent: (event: Omit<CalendarEvent, "id" | "userId">) => Promise<void>;
	updateEvent: (event: CalendarEvent) => Promise<void>;
	deleteEvent: (eventId: CalendarEvent["id"]) => Promise<void>;
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

	async createEvent(event: Omit<CalendarEvent, "id" | "userId">) {
		const res = await client.calendar.events.$post({
			json: {
				...event,
				startAt: event.startAt.toISOString(),
				endAt: event.endAt.toISOString(),
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create event");
		}
	}

	async updateEvent(event: CalendarEvent) {
		const res = await client.calendar.events[":eventId"].$put({
			param: {
				eventId: event.id,
			},
			json: {
				...event,
				startAt: event.startAt.toISOString(),
				endAt: event.endAt.toISOString(),
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update event");
		}
	}

	async deleteEvent(eventId: CalendarEvent["id"]) {
		const res = await client.calendar.events[":eventId"].$delete({
			param: {
				eventId: eventId,
			},
			json: {
				id: eventId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete event");
		}
	}
}
