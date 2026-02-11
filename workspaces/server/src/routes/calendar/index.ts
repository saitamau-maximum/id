import { vValidator } from "@hono/valibot-validator";
import { sign, verify } from "hono/jwt";
import { createEvents, type EventAttributes } from "ics";
import * as v from "valibot";
import { JWT_ALG } from "../../constants/jwt";
import { ROLE_IDS } from "../../constants/role";
import { factory } from "../../factory";
import { memberOnlyMiddleware } from "../../middleware/auth";
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
	.post("/generate-url", memberOnlyMiddleware, async (c) => {
		const { userId } = c.get("jwtPayload");
		// 毎回同じトークンを生成するのはあまり良くないので、ランダムな文字列を付与する
		const randomString = Math.random().toString(36).slice(2);
		const token = await sign({ userId, randomString }, c.env.SECRET, JWT_ALG);
		const requestUrl = new URL(c.req.url);
		return c.text(`${requestUrl.origin}/calendar/calendar.ics?token=${token}`);
	})
	.get("/calendar.ics", vValidator("query", iCalParamSchema), async (c) => {
		const { token } = c.req.valid("query");
		const { UserRepository } = c.var;
		try {
			const payload = await verify(token, c.env.SECRET, JWT_ALG).catch(
				() => undefined,
			);
			if (!payload) {
				return c.text("Unauthorized", 401);
			}
			const { userId } = payload;
			// ユーザーがメンバーであることを確認する
			const user = await UserRepository.fetchUserProfileById(userId as string);
			if (!user) {
				return c.text("Unauthorized", 401);
			}
			if (!user.roles.some((role) => role.id === ROLE_IDS.MEMBER)) {
				return c.text("Forbidden", 403);
			}
		} catch (_e) {
			return c.text("Unauthorized", 401);
		}
		const { CalendarRepository } = c.var;

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
			description: event.description ?? undefined,
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
	});

export { route as calendarRoute };
