import type { Location } from "./location";

export interface CalendarEvent {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	startAt: Date;
	endAt: Date;
	locationId?: Location["id"];
}

export interface CalendarEventWithNotify extends CalendarEvent {
	notifyDiscord: boolean;
}
