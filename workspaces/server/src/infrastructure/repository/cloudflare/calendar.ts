import { and, count, desc, eq, gte, lte, or } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	CreateEventPayload,
	ICalendarEvent,
	ICalendarRepository,
	PaginatedEventsResult,
	PaginationParams,
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

	async getPaginatedEvents(
		params: PaginationParams,
	): Promise<PaginatedEventsResult> {
		const { page, limit, fiscalYear } = params;
		const offset = (page - 1) * limit;

		// Create fiscal year filter if provided
		let whereClause: any = undefined;
		if (fiscalYear) {
			const fiscalYearStart = new Date(`${fiscalYear}-04-01T00:00:00Z`);
			const fiscalYearEnd = new Date(`${fiscalYear + 1}-03-31T23:59:59Z`);
			whereClause = and(
				gte(schema.calendarEvents.startAt, fiscalYearStart.toISOString()),
				lte(schema.calendarEvents.endAt, fiscalYearEnd.toISOString()),
			);
		}

		// Get total count
		const totalCountResult = await this.client
			.select({ count: count() })
			.from(schema.calendarEvents)
			.where(whereClause);
		const total = totalCountResult[0]?.count ?? 0;

		// Get paginated events
		const events = await this.client
			.select()
			.from(schema.calendarEvents)
			.where(whereClause)
			.orderBy(desc(schema.calendarEvents.startAt))
			.limit(limit)
			.offset(offset);

		const totalPages = Math.ceil(total / limit);

		return {
			events: events.map((event) => ({
				...event,
				description: event.description ?? undefined,
				locationId: event.locationId ?? undefined,
				startAt: new Date(event.startAt),
				endAt: new Date(event.endAt),
			})),
			total,
			page,
			limit,
			totalPages,
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
