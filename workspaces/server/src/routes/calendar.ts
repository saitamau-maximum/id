import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const createEventSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
});

const updateEventSchema = v.object({
	id: v.pipe(v.string(), v.nonEmpty()),
	userId: v.pipe(v.string(), v.nonEmpty()),
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
	startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
	endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
});

const deleteEventSchema = v.object({
	id: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.get("/events", authMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		try {
			const events = await CalendarRepository.getAllEvents();
			return c.json(events);
		} catch (e) {
			return c.json({ error: "events not found" }, 404);
		}
	})
	.post(
		"/events",
		authMiddleware,
		vValidator("json", createEventSchema),
		async (c) => {
			const { CalendarRepository } = c.var;
			const { userId } = c.get("jwtPayload");
			const { title, description, startAt, endAt } = c.req.valid("json");
			const eventPayload = {
				userId,
				title,
				description,
				startAt: new Date(startAt),
				endAt: new Date(endAt),
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
		"/events/:eventId",
		authMiddleware,
		vValidator("json", updateEventSchema),
		async (c) => {
			const { CalendarRepository } = c.var;
			const { id, userId, title, description, startAt, endAt } =
				c.req.valid("json");
			const eventPayload = {
				id,
				userId,
				title,
				description,
				startAt: new Date(startAt),
				endAt: new Date(endAt),
			};
			try {
				await CalendarRepository.updateEvent(eventPayload);
				return c.json({ message: "event updated" });
			} catch (e) {
				console.error(e);
				return c.json({ error: "failed to update event" }, 500);
			}
		},
	)
	.delete(
		"/events/:eventId",
		authMiddleware,
		vValidator("json", deleteEventSchema),
		async (c) => {
			const { CalendarRepository } = c.var;
			const eventId = c.req.param("eventId");
			try {
				await CalendarRepository.deleteEvent(eventId);
				return c.json({ message: "event deleted" });
			} catch (e) {
				return c.json({ error: "event not deleted" }, 500);
			}
		},
	);

export { route as calendarRoute };
