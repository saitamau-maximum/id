import { factory } from "../factory";

const app = factory.createApp();

const route = app
	.get("/events", async (c) => {
		const { CalendarRepository } = c.var;
		try {
			const events = await CalendarRepository.getAllEvents();
			return c.json(events);
		} catch (e) {
			return c.json({ error: "events not found" }, 404);
		}
	})

	.post("/events", async (c) => {
		const { CalendarRepository } = c.var;
		const event = await c.req.json();
		console.log(event);
		try {
			await CalendarRepository.createEvent(event);
			return c.json({ message: "event created" });
		} catch (e) {
			return c.json({ error: "event not created" }, 404);
		}
	})

	.put("/events/:eventId", async (c) => {
		const { CalendarRepository } = c.var;
		const event = await c.req.json();
		try {
			await CalendarRepository.updateEvent(event);
			return c.json({ message: "event updated" });
		} catch (e) {
			return c.json({ error: "event not updated" }, 404);
		}
	})

	.delete("/events/:eventId", async (c) => {
		const { CalendarRepository } = c.var;
		const eventId = await c.req.json();
		try {
			await CalendarRepository.deleteEvent(eventId);
			return c.json({ message: "event deleted" });
		} catch (e) {
			return c.json({ error: "event not deleted" }, 404);
		}
	});

export { route as calendarRoute };
