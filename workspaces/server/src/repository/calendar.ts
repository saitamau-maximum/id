export interface ICalendarEvent {
	id: string;
	userId: string;
	title: string;
	description: string;
	startAt: string;
	endAt: string;
}
export type CreateEventPayload = Omit<ICalendarEvent, "id">;

export interface ICalendarRepository {
	getAllEvents: () => Promise<ICalendarEvent[]>;
	createEvent: (event: CreateEventPayload) => Promise<void>;
	updateEvent: (event: ICalendarEvent) => Promise<void>;
	deleteEvent: (eventId: ICalendarEvent["id"]) => Promise<void>;
}
