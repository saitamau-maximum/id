import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../../factory";
import {
	adminOnlyMiddleware,
	memberOnlyMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const createLocationSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
});

const updateLocationSchema = v.object({
	id: v.pipe(v.string(), v.nonEmpty()),
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { LocationRepository } = c.var;

		try {
			const locations = await LocationRepository.getLocations();
			return c.json(locations);
		} catch (e) {
			return c.json({ error: "location not found" }, 404);
		}
	})
	.get("/:id", memberOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { LocationRepository } = c.var;

		try {
			const location = await LocationRepository.getLocationById(id);
			return c.json(location);
		} catch (e) {
			return c.json({ error: "location not found" }, 404);
		}
	})
	.post(
		"/",
		adminOnlyMiddleware,
		vValidator("json", createLocationSchema),
		async (c) => {
			const { name, description } = c.req.valid("json");
			const { LocationRepository } = c.var;

			try {
				await LocationRepository.createLocation({
					name,
					description,
					createdAt: new Date(),
				});
				return c.json({ message: "location created" });
			} catch (e) {
				return c.json({ error: "location not created" }, 404);
			}
		},
	)
	.put(
		"/:id",
		adminOnlyMiddleware,
		vValidator("json", updateLocationSchema),
		async (c) => {
			const id = c.req.param("id");
			const { name, description } = c.req.valid("json");
			const { LocationRepository } = c.var;

			try {
				await LocationRepository.updateLocation({
					id,
					name,
					description,
					createdAt: new Date(),
				});
				return c.json({ message: "location updated" });
			} catch (e) {
				return c.json({ error: "location not updated" }, 404);
			}
		},
	)
	.delete("/:id", adminOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { LocationRepository } = c.var;

		try {
			await LocationRepository.deleteLocation(id);
			return c.json({ message: "location deleted" });
		} catch (e) {
			return c.json({ error: "location not deleted" }, 404);
		}
	});

export { route as calendarLocationRoute };
