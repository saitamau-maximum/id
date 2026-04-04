import type { Location } from "@idp/schema/entity/calendar/location";

export interface CalendarEvent {
	id: string;
	userId: string;
	title: string;
	description?: string;
	startAt: Date;
	endAt: Date;
	locationId?: Location["id"];
}

export interface CalendarEventWithNotify extends CalendarEvent {
	notifyDiscord: boolean;
}
