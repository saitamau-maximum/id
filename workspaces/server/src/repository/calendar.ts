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

export interface PaginationParams {
	page: number;
	limit: number;
	fiscalYear?: number;
}

export interface PaginatedEventsResult {
	events: ICalendarEvent[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ICalendarRepository {
	getAllEvents: () => Promise<ICalendarEvent[]>;
	getAllEventsWithLocation: () => Promise<ICalendarEventWithLocation[]>;
	getEventById: (eventId: ICalendarEvent["id"]) => Promise<ICalendarEvent>;
	getPaginatedEvents: (
		params: PaginationParams,
	) => Promise<PaginatedEventsResult>;
	createEvent: (event: CreateEventPayload) => Promise<void>;
	updateEvent: (event: ICalendarEvent) => Promise<void>;
	deleteEvent: (eventId: ICalendarEvent["id"]) => Promise<void>;
}
