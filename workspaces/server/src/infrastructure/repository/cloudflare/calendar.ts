import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { CreateEventPayload, ICalendarEvent, ICalendarRepository } from "../../../repository/calendar";
import { eq } from "drizzle-orm";

export class CloudflareCalendarRepository implements ICalendarRepository {
    private client: DrizzleD1Database<typeof schema>;

    constructor(db: D1Database) {
        this.client = drizzle(db, { schema });
    }

    async getAllEvents(): Promise<ICalendarEvent[]> {
        const res =  await this.client.query.calendarEvents.findMany();
        return res;
    }

    async createEvent(event: CreateEventPayload): Promise<void> {
        await this.client.insert(schema.calendarEvents).values({ ...event, id: crypto.randomUUID() });
    }

    async updateEvent(event: ICalendarEvent): Promise<void> {
        await this.client.update(schema.calendarEvents).set(event);
    }

    async deleteEvent(eventId: ICalendarEvent["id"]): Promise<void> {
        await this.client.delete(schema.calendarEvents).where(eq(schema.calendarEvents.id, eventId));
    }
}