import { vValidator } from "@hono/valibot-validator";
import {
	CreateEventParams,
	UpdateEventParams,
} from "@idp/schema/api/calendar/events";
import { ROLE_IDS } from "@idp/schema/entity/role";
import { factory } from "../../factory";
import {
	calendarMutableMiddleware,
	memberOnlyMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		const events = await CalendarRepository.getAllEvents();
		return c.json(events);
	})
	.post(
		"/",
		calendarMutableMiddleware,
		vValidator("json", CreateEventParams),
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
				startAt,
				endAt,
				locationId,
			};

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

			return c.body(null, 201);
		},
	)
	.put(
		"/:id",
		calendarMutableMiddleware,
		vValidator("json", UpdateEventParams),
		async (c) => {
			const { CalendarRepository, DiscordBotRepository, LocationRepository } =
				c.var;
			const { userId } = c.get("jwtPayload");
			const { title, description, startAt, endAt, locationId, notifyDiscord } =
				c.req.valid("json");
			const id = c.req.param("id");
			const eventPayload = {
				id,
				userId,
				title,
				description,
				startAt,
				endAt,
				locationId,
			};

			// イベントが存在するかチェック
			const event = await CalendarRepository.getEventById(id).catch(() => null);
			if (!event) {
				return c.body(null, 404);
			}

			// もしAdminじゃないなら、自分のイベントだけ更新できる
			const roleIds = c.get("roleIds");
			if (!roleIds.includes(ROLE_IDS.ADMIN) && event.userId !== userId) {
				return c.body(null, 403);
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
			return c.body(null, 204);
		},
	)
	.delete("/:id", calendarMutableMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		const id = c.req.param("id");
		const { userId } = c.get("jwtPayload");

		// イベントが存在するかチェック
		const event = await CalendarRepository.getEventById(id).catch(() => null);
		if (!event) {
			return c.body(null, 404);
		}

		// もしAdminじゃないなら、自分のイベントだけ削除できる
		const roleIds = c.get("roleIds");
		if (!roleIds.includes(ROLE_IDS.ADMIN) && event.userId !== userId) {
			return c.body(null, 403);
		}

		// イベントを削除
		await CalendarRepository.deleteEvent(id);
		return c.body(null, 204);
	});

export { route as calendarEventRoute };
