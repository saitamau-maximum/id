import { vValidator } from "@hono/valibot-validator";
import { sign, verify } from "hono/jwt";
import { type EventAttributes, createEvents } from "ics";
import * as v from "valibot";
import { factory } from "../../factory";
import { authMiddleware } from "../../middleware/auth";
import { calendarEventRoute } from "./events";
import { calendarLocationRoute } from "./location";

const app = factory.createApp();

const iCalParamSchema = v.object({
	token: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	// 活動場所等が筒抜けになると怖いので、基本的には認証が必要とする
	.route("/events", calendarEventRoute)
	.route("/locations", calendarLocationRoute)
	.post("/generate-url", authMiddleware, async (c) => {
		const { userId } = c.get("jwtPayload");
		// 毎回同じトークンを生成するのはあまり良くないので、ランダムな文字列を付与する
		const randomString = Math.random().toString(36).slice(2);
		const token = await sign({ userId, randomString }, c.env.SECRET);
		const requestUrl = new URL(c.req.url);
		return c.text(`${requestUrl.origin}/calendar/calendar.ics?token=${token}`);
	})
	.get("/calendar.ics", vValidator("query", iCalParamSchema), async (c) => {
		const { token } = c.req.valid("query");
		try {
			await verify(token, c.env.SECRET);
		} catch (e) {
			return c.text("Unauthorized", 401);
		}
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
				uid: event.id,
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
