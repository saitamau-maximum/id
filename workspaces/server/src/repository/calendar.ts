import type {
	Event,
	EventWithLocation,
} from "@idp/schema/entity/calendar/event";

export type CreateEventPayload = Omit<Event, "id">;
export type UpdateEventPayload = Event;

export type GetAllEventsRes = Event[];
export type GetAllEventsWithLocationRes = EventWithLocation[];
export type GetEventByIdRes = EventWithLocation;

export interface ICalendarRepository {
	getAllEvents: () => Promise<GetAllEventsRes>;
	getAllEventsWithLocation: () => Promise<GetAllEventsWithLocationRes>;
	getEventById: (eventId: Event["id"]) => Promise<Event>;
	createEvent: (event: CreateEventPayload) => Promise<void>;
	updateEvent: (event: UpdateEventPayload) => Promise<void>;
	deleteEvent: (eventId: Event["id"]) => Promise<void>;
}
