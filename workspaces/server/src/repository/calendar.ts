export interface ICalendarEvent {
	id: string;
	userId: string;
	title: string;
	description?: string;
	startAt: Date;
	endAt: Date;
	locationId?: string;
}

export type CreateEventPayload = Omit<ICalendarEvent, "id">;

export type ICalendarEventWithLocation = ICalendarEvent & {
	location?: {
		id: string;
		name: string;
		description?: string;
	};
};

export interface ICalendarRepository {
	getAllEvents: () => Promise<ICalendarEvent[]>;
	getAllEventsWithLocation: () => Promise<ICalendarEventWithLocation[]>;
	getEventById: (eventId: ICalendarEvent["id"]) => Promise<ICalendarEvent>;
	createEvent: (event: CreateEventPayload) => Promise<void>;
	updateEvent: (event: ICalendarEvent) => Promise<void>;
	deleteEvent: (eventId: ICalendarEvent["id"]) => Promise<void>;
}

export type ICalendarEventNotify = Omit<ICalendarEventWithLocation, "id">;

export interface ICalendarNotifier {
	notifyAddEvent: (event: ICalendarEventNotify) => Promise<void>;
	notifyUpdateEvent: (event: ICalendarEventNotify) => Promise<void>;
}
