import crypto from "node:crypto";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";

export const DUMMY_EVENTS = [
	{
		title: "event1",
		description: "event1",
		startAt: "2021-01-01T00:00:00.000Z",
		endAt: "2021-01-01T01:00:00.000Z",
		userId: "user1",
	},
	{
		title: "event2",
		description: "event2",
		startAt: "2021-01-02T00:00:00.000Z",
		endAt: "2021-01-02T01:00:00.000Z",
		userId: "user2",
	},
	{
		title: "event3",
		description: "event3",
		startAt: "2021-01-03T00:00:00.000Z",
		endAt: "2021-01-03T01:00:00.000Z",
		userId: "user3",
	},
	{
		title: "event4",
		description: "event4",
		startAt: "2021-01-04T00:00:00.000Z",
		endAt: "2021-01-04T01:00:00.000Z",
		userId: "user4",
	},
	{
		title: "event5",
		description: "event5",
		startAt: "2021-01-05T00:00:00.000Z",
		endAt: "2021-01-05T01:00:00.000Z",
		userId: "user5",
	},
];

export const registerCalendarSeed = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	for (const event of DUMMY_EVENTS) {
		const res = await client.query.users.findFirst({
			where: (user, { eq }) => eq(user.id, event.userId),
		});
		if (!res) {
			console.error(`ユーザーが見つかりませんでした: ${event.userId}`);
			console.log("ユーザー登録シナリオを実行してから再度実行してください");
			return;
		}

		await client.insert(schema.calendarEvents).values({
			...event,
			id: crypto.randomUUID().toString(),
		});
	}
};
