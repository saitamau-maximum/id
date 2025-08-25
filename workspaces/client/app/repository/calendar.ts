import type { CalendarEvent, CalendarEventWithNotify } from "~/types/event";
import { client } from "~/utils/hono";

export interface PaginatedEventsResult {
	events: CalendarEvent[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ICalendarRepository {
	getAllEvents: () => Promise<CalendarEvent[]>;
	getAllEvents$$key: () => unknown[];
	getPaginatedEvents: (params: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) => Promise<PaginatedEventsResult>;
	getPaginatedEvents$$key: (params: {
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

	async getPaginatedEvents(params: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) {
		const queryParams: Record<string, string> = {
			page: params.page.toString(),
			limit: params.limit.toString(),
		};
		
		if (params.fiscalYear) {
			queryParams.fiscalYear = params.fiscalYear.toString();
		}

		const res = await client.calendar.events.paginated.$get({
			query: queryParams,
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

	getPaginatedEvents$$key(params: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) {
		return ["calendar-events-paginated", params.page, params.limit, params.fiscalYear];
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
