import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	CreateEventPayload,
	ICalendarEvent,
	ICalendarRepository,
	PaginatedEventsResult,
} from "../../../repository/calendar";

export class CloudflareCalendarRepository implements ICalendarRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getAllEvents(): Promise<ICalendarEvent[]> {
		const res = await this.client.query.calendarEvents.findMany();
		return res.map((event) => ({
			...event,
			description: event.description ?? undefined,
			locationId: event.locationId ?? undefined,
			startAt: new Date(event.startAt),
			endAt: new Date(event.endAt),
		}));
	}

	async getAllEventsWithLocation(): Promise<ICalendarEvent[]> {
		const res = await this.client.query.calendarEvents.findMany({
			with: {
				location: true,
			},
		});

		return res.map((event) => ({
			...event,
			description: event.description ?? undefined,
			locationId: event.locationId ?? undefined,
			startAt: new Date(event.startAt),
			endAt: new Date(event.endAt),
		}));
	}

	async getPaginatedEvents(params: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}): Promise<PaginatedEventsResult> {
		const { page, limit, fiscalYear } = params;
		const offset = (page - 1) * limit;

		let whereCondition;
		
		if (fiscalYear) {
			// Fiscal year in Japan runs from April 1st to March 31st
			const fiscalYearStart = new Date(fiscalYear, 3, 1); // April 1st
			const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31, 23, 59, 59); // March 31st
			
			whereCondition = or(
				and(
					gte(schema.calendarEvents.startAt, fiscalYearStart.toISOString()),
					lte(schema.calendarEvents.startAt, fiscalYearEnd.toISOString())
				),
				and(
					gte(schema.calendarEvents.endAt, fiscalYearStart.toISOString()),
					lte(schema.calendarEvents.endAt, fiscalYearEnd.toISOString())
				)
			);
		}

		// Get total count
		const totalResult = await this.client
			.select({ count: sql<number>`count(*)` })
			.from(schema.calendarEvents)
			.where(whereCondition);
		
		const total = totalResult[0]?.count ?? 0;

		// Get paginated results
		const events = await this.client.query.calendarEvents.findMany({
			where: whereCondition,
			orderBy: desc(schema.calendarEvents.startAt),
			limit,
			offset,
		});

		const mappedEvents = events.map((event) => ({
			...event,
			description: event.description ?? undefined,
			locationId: event.locationId ?? undefined,
			startAt: new Date(event.startAt),
			endAt: new Date(event.endAt),
		}));

		return {
			events: mappedEvents,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getEventById(eventId: ICalendarEvent["id"]): Promise<ICalendarEvent> {
		const res = await this.client.query.calendarEvents.findFirst({
			where: eq(schema.calendarEvents.id, eventId),
		});
		if (!res) {
			throw new Error("Event not found");
		}
		return {
			...res,
			description: res.description ?? undefined,
			locationId: res.locationId ?? undefined,
			startAt: new Date(res.startAt),
			endAt: new Date(res.endAt),
		};
	}

	async createEvent(event: CreateEventPayload): Promise<void> {
		const newEvent = {
			...event,
			startAt: event.startAt.toISOString(),
			endAt: event.endAt.toISOString(),
			id: crypto.randomUUID(),
		};
		await this.client.insert(schema.calendarEvents).values(newEvent);
	}

	async updateEvent(event: ICalendarEvent): Promise<void> {
		const updatedEvent = {
			...event,
			startAt: event.startAt.toISOString(),
			endAt: event.endAt.toISOString(),
		};
		await this.client
			.update(schema.calendarEvents)
			.set(updatedEvent)
			.where(eq(schema.calendarEvents.id, event.id));
	}

	async deleteEvent(eventId: ICalendarEvent["id"]): Promise<void> {
		await this.client
			.delete(schema.calendarEvents)
			.where(eq(schema.calendarEvents.id, eventId));
	}
}
