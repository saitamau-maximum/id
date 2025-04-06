import { eq } from "drizzle-orm";
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
			locationId: event.locationId ?? undefined,
			startAt: new Date(event.startAt),
			endAt: new Date(event.endAt),
		}));
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
