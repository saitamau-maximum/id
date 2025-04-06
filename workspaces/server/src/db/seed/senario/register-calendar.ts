import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";

const getRandomDateInRange = (start: Date, end: Date) => {
	const date = new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
	return date.toISOString();
};

const generateDummyEvents = (numEvents: number) => {
	const events = [];
	const now = new Date();
	const oneMonth = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds
	const startRange = new Date(now.getTime() - oneMonth);
	const endRange = new Date(now.getTime() + oneMonth);

	for (let i = 0; i < numEvents; i++) {
		const startAt = getRandomDateInRange(startRange, endRange);
		let endAt: string;
		let title: string;
		let description: string;

		if (i % 3 === 0) {
			// 合宿
			title = `合宿${i / 3 + 1}`;
			const endDate = new Date(startAt);
			endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1 to 3 days
			endAt = endDate.toISOString();
			description = `${now.getFullYear()}年度の合宿です。〇〇に行きます。`;
		} else if (i % 2 === 0) {
			// 〇〇大会
			title = `〇〇大会${i / 2 + 1}`;
			const endDate = new Date(startAt);
			endDate.setHours(endDate.getHours() + 6); // 6 hours event
			endAt = endDate.toISOString();
			description = `${now.getFullYear()}年度の〇〇大会です。参加者は〇〇です。`;
		} else {
			// ××講習会
			title = `××講習会${Math.floor(i / 2) + 1}`;
			const endDate = new Date(startAt);
			endDate.setHours(endDate.getHours() + 2); // 2 hours event
			endAt = endDate.toISOString();
			description = `${now.getFullYear()}年度の××講習会です、講師は△△です。いつも通り持ち物を持参してください。`;
		}

		events.push({
			title,
			description,
			startAt,
			endAt,
			userId: `user${(i % 5) + 1}`, // Cycle through user1 to user5
		});
	}
	return events;
};

export const DUMMY_EVENTS = generateDummyEvents(10);

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
