import { vValidator } from "@hono/valibot-validator";
import { validator } from "hono/validator";
import * as v from "valibot";
import { ROLE_IDS } from "../../constants/role";
import { factory } from "../../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const createEventSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	locationId: v.optional(v.string()),
});

const updateEventSchema = v.object({
	userId: v.pipe(v.string(), v.nonEmpty()),
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	locationId: v.optional(v.string()),
});

const route = app
	.use(authMiddleware)
	.get("/", async (c) => {
		const { CalendarRepository } = c.var;
		try {
			const events = await CalendarRepository.getAllEvents();
			return c.json(events);
		} catch (e) {
			return c.json({ error: "events not found" }, 404);
		}
	})
	.post(
		"/",
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
		vValidator("json", createEventSchema),
		validator("json", (value, c) => {
			if (new Date(value.startAt) >= new Date(value.endAt)) {
				return c.json({ error: "startAt must be before endAt" }, 400);
			}
			return value;
		}),
		async (c) => {
			const { CalendarRepository } = c.var;
			const { userId } = c.get("jwtPayload");
			const { title, description, startAt, endAt, locationId } =
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
				return c.json({ message: "event created" });
			} catch (e) {
				return c.json({ error: "event not created" }, 404);
			}
		},
	)
	.put(
		"/:id",
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
		vValidator("json", updateEventSchema),
		validator("json", (value, c) => {
			if (new Date(value.startAt) >= new Date(value.endAt)) {
				return c.json({ error: "startAt must be before endAt" }, 400);
			}
			return value;
		}),
		async (c) => {
			const { CalendarRepository } = c.var;
			const { userId, title, description, startAt, endAt, locationId } =
				c.req.valid("json");
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
				await CalendarRepository.updateEvent(eventPayload);
				return c.json({ message: "event updated" });
			} catch (e) {
				return c.json({ error: "failed to update event" }, 500);
			}
		},
	)
	.delete(
		"/:id",
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
		async (c) => {
			const { CalendarRepository } = c.var;
			const id = c.req.param("id");
			try {
				await CalendarRepository.deleteEvent(id);
				return c.json({ message: "event deleted" });
			} catch (e) {
				return c.json({ error: "event not deleted" }, 500);
			}
		},
	);

export { route as calendarEventRoute };
