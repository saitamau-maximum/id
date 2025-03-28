import { type EventAttributes, createEvents } from "ics";
import { factory } from "../../factory";
import { calendarEventRoute } from "./events";
import { calendarLocationRoute } from "./location";

const app = factory.createApp();

const route = app
	// 活動場所等が筒抜けになると怖いので、基本的には認証が必要とする
	.route("/events", calendarEventRoute)
	.route("/locations", calendarLocationRoute)
	.get("/calendar.ics", async (c) => {
		const { CalendarRepository } = c.var;
		try {
			const events = await CalendarRepository.getAllEventsWithLocation();
			const icsEvents: EventAttributes[] = events.map((event) => ({
				start: [
					event.startAt.getFullYear(),
					event.startAt.getMonth() + 1,
					event.startAt.getDate(),
					event.startAt.getHours(),
					event.startAt.getMinutes(),
				],
				end: [
					event.endAt.getFullYear(),
					event.endAt.getMonth() + 1,
					event.endAt.getDate(),
					event.endAt.getHours(),
					event.endAt.getMinutes(),
				],
				title: event.title,
				description: event.description,
				location: event.location?.name,
				url: `${c.env.CLIENT_ORIGIN}/calendar`,
			}));

			const { error, value } = createEvents(icsEvents);
			if (error) {
				return c.text("Internal Server Error", 500);
			}
			c.header("Content-Type", "text/calendar");
			return c.text(value || "");
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	});

export { route as calendarRoute };
