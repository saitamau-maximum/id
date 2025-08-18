import type { CalendarEvent, CalendarEventWithNotify } from "~/types/event";
import { client } from "~/utils/hono";

export interface PaginationParams {
	page: number;
	limit: number;
	fiscalYear?: number;
}

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
	getPaginatedEvents: (params: PaginationParams) => Promise<PaginatedEventsResult>;
	getPaginatedEvents$$key: (params: PaginationParams) => unknown[];
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

	async getPaginatedEvents(params: PaginationParams): Promise<PaginatedEventsResult> {
		const { page, limit, fiscalYear } = params;
		const searchParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		
		if (fiscalYear) {
			searchParams.set("fiscalYear", fiscalYear.toString());
		}

		const res = await client.calendar.events.paginated.$get({
			query: Object.fromEntries(searchParams),
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

	getPaginatedEvents$$key(params: PaginationParams) {
		return ["calendar-events-paginated", params];
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
