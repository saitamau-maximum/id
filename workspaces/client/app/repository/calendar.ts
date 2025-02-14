import { client } from "~/utils/hono";

export interface ICalendarEvent {
    id: string;
    userId: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
}

export interface CreateEventPayload {
    userId: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
}

export interface ICalendarRepository {
    getAllEvents: () => Promise<ICalendarEvent[]>;
    getAllEvents$$key: () => string;
    createEvent: (event: CreateEventPayload) => Promise<void>;
    updateEvent: (event: ICalendarEvent) => Promise<void>;
    deleteEvent: (eventId: ICalendarEvent["id"]) => Promise<void>;
}

export class CalendarRepositoryImpl implements ICalendarRepository {
    async getAllEvents() {
        const res = await client.calendar.events.$get();
        if (!res.ok) {
            throw new Error("Failed to fetch events");
        }
        return res.json();
    }

    getAllEvents$$key() {
        return "calendar-events";
    }

    async createEvent(event: CreateEventPayload) {
        const res = await client.calendar.events.$post({
            json: event,
        });
        if (!res.ok) {
            throw new Error("Failed to create event");
        }
    }

    async updateEvent(event: ICalendarEvent) {
        const res = await client.calendar.events[":eventId"].$put({
            param: {
                eventId: event.id,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to update event");
        }
    }

    async deleteEvent(eventId: ICalendarEvent["id"]) {
        const res = await client.calendar.events[":eventId"].$delete({
            param: {
                eventId,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to delete event");
        }
    }
}