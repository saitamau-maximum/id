import type { CalendarEvent, CalendarEventWithNotify } from "~/types/event";
import { client } from "~/utils/hono";

export interface ICalendarRepository {
	getAllEvents: () => Promise<CalendarEvent[]>;
	getAllEvents$$key: () => unknown[];
	getPaginatedEvents: (options: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) => Promise<{
		events: CalendarEvent[];
		total: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	}>;
	getPaginatedEvents$$key: (options: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) => unknown[];
	createEvent: (
		event: Omit<CalendarEventWithNotify, "id" | "userId">,
	) => Promise<void>;
	updateEvent: (event: CalendarEventWithNotify) => Promise<void>;
	deleteEvent: (id: CalendarEvent["id"]) => Promise<void>;
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

	async getPaginatedEvents(options: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) {
		const { page, limit, fiscalYear } = options;
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		
		if (fiscalYear) {
			queryParams.append("fiscalYear", fiscalYear.toString());
		}

		const res = await client.calendar.events.paginated.$get({
			query: Object.fromEntries(queryParams),
		});
		
		if (!res.ok) {
			throw new Error("Failed to fetch paginated events");
		}

		const result = await res.json();
		return {
			...result,
			events: result.events.map((event) => ({
				...event,
				startAt: new Date(event.startAt),
				endAt: new Date(event.endAt),
			})),
		};
	}

	getPaginatedEvents$$key(options: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) {
		return ["calendar-events-paginated", options];
	}

	async createEvent(event: Omit<CalendarEventWithNotify, "id" | "userId">) {
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

	async updateEvent(event: CalendarEventWithNotify) {
		const res = await client.calendar.events[":id"].$put({
			param: {
				id: event.id,
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

	async deleteEvent(id: CalendarEvent["id"]) {
		const res = await client.calendar.events[":id"].$delete({
			param: {
				id,
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
