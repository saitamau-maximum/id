import { vValidator } from "@hono/valibot-validator";
import {
	CalendarLocationCreateParams,
	CalendarLocationUpdateParams,
} from "@idp/schema/api/calendar/location";
import { factory } from "../../factory";
import {
	adminOnlyMiddleware,
	memberOnlyMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { LocationRepository } = c.var;
		const locations = await LocationRepository.getLocations();
		return c.json(locations);
	})
	.get("/:id", memberOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { LocationRepository } = c.var;

		const location = await LocationRepository.getLocationById(id).catch(
			() => null,
		);
		if (!location) {
			return c.body(null, 404);
		}
		return c.json(location);
	})
	.post(
		"/",
		adminOnlyMiddleware,
		vValidator("json", CalendarLocationCreateParams),
		async (c) => {
			const { name, description } = c.req.valid("json");
			const { LocationRepository } = c.var;

			await LocationRepository.createLocation({
				name,
				description,
				createdAt: new Date(),
			});

			return c.body(null, 201);
		},
	)
	.put(
		"/:id",
		adminOnlyMiddleware,
		vValidator("json", CalendarLocationUpdateParams),
		async (c) => {
			const id = c.req.param("id");
			const { name, description } = c.req.valid("json");
			const { LocationRepository } = c.var;

			// location が存在するかチェック
			const location = await LocationRepository.getLocationById(id).catch(
				() => null,
			);
			if (!location) {
				return c.body(null, 404);
			}

			await LocationRepository.updateLocation({
				id,
				name,
				description,
				createdAt: new Date(),
			});
			return c.body(null, 204);
		},
	)
	.delete("/:id", adminOnlyMiddleware, async (c) => {
		const id = c.req.param("id");
		const { LocationRepository } = c.var;

		// location が存在するかチェック
		const location = await LocationRepository.getLocationById(id).catch(
			() => null,
		);
		if (!location) {
			return c.body(null, 404);
		}

		await LocationRepository.deleteLocation(id);
		return c.body(null, 204);
	});

export { route as calendarLocationRoute };
