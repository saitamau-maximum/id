import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { ROLE_IDS } from "../../constants/role";
import { factory } from "../../factory";
import {
	calendarMutableMiddleware,
	memberOnlyMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const createEventSchema = v.pipe(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		description: v.optional(v.string()),
		startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
		endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
		locationId: v.optional(v.string()),
		notifyDiscord: v.boolean(),
	}),
	v.check(
		({ startAt, endAt }) => new Date(startAt) < new Date(endAt),
		"startAt must be before endAt",
	),
);

const updateEventSchema = v.pipe(
	v.object({
		userId: v.pipe(v.string(), v.nonEmpty()),
		title: v.pipe(v.string(), v.nonEmpty()),
		description: v.optional(v.string()),
		startAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
		endAt: v.pipe(v.string(), v.isoTimestamp(), v.nonEmpty()),
		locationId: v.optional(v.string()),
		notifyDiscord: v.boolean(),
	}),
	v.check(
		({ startAt, endAt }) => new Date(startAt) < new Date(endAt),
		"startAt must be before endAt",
	),
);

const paginationQuerySchema = v.object({
	page: v.optional(v.pipe(v.string(), v.transform(Number)), "1"),
	limit: v.optional(v.pipe(v.string(), v.transform(Number)), "10"),
	fiscalYear: v.optional(v.pipe(v.string(), v.transform(Number))),
});

const route = app
	.get("/", memberOnlyMiddleware, async (c) => {
		const { CalendarRepository } = c.var;
		const events = await CalendarRepository.getAllEvents();
		return c.json(events);
	})
	.get("/paginated", memberOnlyMiddleware, vValidator("query", paginationQuerySchema), async (c) => {
		const { CalendarRepository } = c.var;
		const { page, limit, fiscalYear } = c.req.valid("query");
		
		const result = await CalendarRepository.getPaginatedEvents({
			page: Number(page) || 1,
			limit: Math.min(Number(limit) || 10, 100), // Cap at 100 items per page
			fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
		});
		
		return c.json(result);
	})
	.post(
		"/",
		calendarMutableMiddleware,
		vValidator("json", createEventSchema),
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
		vValidator("json", updateEventSchema),
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
