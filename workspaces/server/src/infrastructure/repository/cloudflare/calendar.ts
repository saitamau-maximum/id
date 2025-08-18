import { count, desc, eq, and, gte, lte } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	CreateEventPayload,
	ICalendarEvent,
	ICalendarRepository,
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

	async getPaginatedEvents(options: {
		page: number;
		limit: number;
		fiscalYear?: number;
	}) {
		const { page, limit, fiscalYear } = options;
		const offset = (page - 1) * limit;

		// Build where conditions
		let whereConditions = undefined;
		if (fiscalYear) {
			// Fiscal year in Japan: April 1st to March 31st of next year
			const fiscalYearStart = new Date(fiscalYear, 3, 1); // April 1st
			const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31, 23, 59, 59); // March 31st next year
			
			whereConditions = and(
				gte(schema.calendarEvents.startAt, fiscalYearStart.toISOString()),
				lte(schema.calendarEvents.startAt, fiscalYearEnd.toISOString())
			);
		}

		// Get total count
		const [totalResult] = await this.client
			.select({ count: count() })
			.from(schema.calendarEvents)
			.where(whereConditions);

		const total = totalResult.count;
		const totalPages = Math.ceil(total / limit);

		// Get paginated events
		const events = await this.client.query.calendarEvents.findMany({
			where: whereConditions,
			orderBy: [desc(schema.calendarEvents.startAt)],
			limit,
			offset,
		});

		return {
			events: events.map((event) => ({
				...event,
				description: event.description ?? undefined,
				locationId: event.locationId ?? undefined,
				startAt: new Date(event.startAt),
				endAt: new Date(event.endAt),
			})),
			total,
			totalPages,
			currentPage: page,
			limit,
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
