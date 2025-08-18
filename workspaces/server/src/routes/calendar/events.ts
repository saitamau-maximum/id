import { vValidator } from "@hono/valibot-validator";
import { validator } from "hono/validator";
import * as v from "valibot";
import { ROLE_IDS } from "../../constants/role";
import { factory } from "../../factory";
import {
	calendarMutableMiddleware,
	memberOnlyMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const createEventSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.optional(v.string()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	locationId: v.optional(v.string()),
	notifyDiscord: v.boolean(),
});

const updateEventSchema = v.object({
	userId: v.pipe(v.string(), v.nonEmpty()),
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.optional(v.string()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	locationId: v.optional(v.string()),
	notifyDiscord: v.boolean(),
});

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		try {
			const events = await CalendarRepository.getAllEvents();
			return c.json(events);
		} catch (e) {
			return c.json({ error: "events not found" }, 404);
		}
	})
	.get("/paginated", memberOnlyMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		const page = Number(c.req.query("page")) || 1;
		const limit = Number(c.req.query("limit")) || 10;
		const fiscalYear = c.req.query("fiscalYear") 
			? Number(c.req.query("fiscalYear")) 
			: undefined;

		try {
			const result = await CalendarRepository.getPaginatedEvents({
				page,
				limit,
				fiscalYear,
			});
			return c.json(result);
		} catch (e) {
			return c.json({ error: "events not found" }, 404);
		}
	})
	.post(
		"/",
		calendarMutableMiddleware,
		vValidator("json", createEventSchema),
		validator("json", (value, c) => {
			if (new Date(value.startAt) >= new Date(value.endAt)) {
				return c.json({ error: "startAt must be before endAt" }, 400);
			}
			return value;
		}),
		async (c) => {
			const { CalendarRepository, DiscordBotRepository, LocationRepository } =
				c.var;
			const { userId } = c.get("jwtPayload");
			const { title, description, startAt, endAt, locationId, notifyDiscord } =
				c.req.valid("json");
			const eventPayload = {
				userId,
				title,
				description,
				startAt: new Date(startAt),
				endAt: new Date(endAt),
				locationId,
			};

			try {
				await CalendarRepository.createEvent(eventPayload);

				if (notifyDiscord) {
					const location = locationId
						? await LocationRepository.getLocationById(locationId)
						: undefined;
					await DiscordBotRepository.sendCalendarNotification("new", {
						...eventPayload,
						location,
					});
				}

				return c.json({ message: "event created" });
			} catch (e) {
				return c.json({ error: "failed to create event" }, 500);
			}
		},
	)
	.put(
		"/:id",
		calendarMutableMiddleware,
		vValidator("json", updateEventSchema),
		validator("json", (value, c) => {
			if (new Date(value.startAt) >= new Date(value.endAt)) {
				return c.json({ error: "startAt must be before endAt" }, 400);
			}
			return value;
		}),
		async (c) => {
			const { CalendarRepository, DiscordBotRepository, LocationRepository } =
				c.var;
			const {
				userId,
				title,
				description,
				startAt,
				endAt,
				locationId,
				notifyDiscord,
			} = c.req.valid("json");
			const id = c.req.param("id");
			const eventPayload = {
				id,
				userId,
				title,
				description,
				startAt: new Date(startAt),
				endAt: new Date(endAt),
				locationId,
			};
			try {
				// もしAdminじゃないなら、自分のイベントだけ更新できる
				const roleIds = c.get("roleIds");
				if (!roleIds.includes(ROLE_IDS.ADMIN)) {
					const event = await CalendarRepository.getEventById(id);
					if (event.userId !== userId) {
						return c.json({ error: "Forbidden" }, 403);
					}
				}
				// イベントを更新
				await CalendarRepository.updateEvent(eventPayload);

				if (notifyDiscord) {
					const location = locationId
						? await LocationRepository.getLocationById(locationId)
						: undefined;
					await DiscordBotRepository.sendCalendarNotification("update", {
						...eventPayload,
						location,
					});
				}
				return c.json({ message: "event updated" });
			} catch (e) {
				return c.json({ error: "failed to update event" }, 500);
			}
		},
	)
	.delete("/:id", calendarMutableMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		const id = c.req.param("id");
		const { userId } = c.get("jwtPayload");
		try {
			// もしAdminじゃないなら、自分のイベントだけ削除できる
			const roleIds = c.get("roleIds");
			if (!roleIds.includes(ROLE_IDS.ADMIN)) {
				const event = await CalendarRepository.getEventById(id);
				if (event.userId !== userId) {
					return c.json({ error: "Forbidden" }, 403);
				}
			}
			// イベントを削除
			await CalendarRepository.deleteEvent(id);
			return c.json({ message: "event deleted" });
		} catch (e) {
			return c.json({ error: "event not deleted" }, 500);
		}
	});

export { route as calendarEventRoute };
