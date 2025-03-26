import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";

// AIで適当に生成したので、実際の施設とは一致しないよ
const DUMMY_LOCATIONS: (typeof schema.locations.$inferSelect)[] = [
	{
		id: crypto.randomUUID().toString(),
		name: "全学講義棟1号館 シアター室",
		description: `
全額講義棟1号館は第一食堂近くにある講義棟です。

![全学講義棟1号館](https://placehold.jp/1080x720.png)

入口入ってすぐ右の扉がシアター室です。`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "全学講義棟3号館 101教室",
		description: `
全学講義棟3号館は駐輪場近くにある講義棟です。

![全学講義棟3号館](https://placehold.jp/1080x720.png)

1階の101教室です。
`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "図書館 自習室A",
		description: `
図書館の1階にある自習室Aです。

![図書館 自習室A](https://placehold.jp/1080x720.png)

静かに学習できる環境が整っています。
`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "体育館 メインアリーナ",
		description: `
体育館のメインアリーナです。

![体育館 メインアリーナ](https://placehold.jp/1080x720.png)

バスケットボールやバレーボールなどのスポーツが行えます。
`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "学生会館 会議室B",
		description: `
学生会館の2階にある会議室Bです。

![学生会館 会議室B](https://placehold.jp/1080x720.png)

会議やグループディスカッションに最適です。
`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "工学部棟 実験室C",
		description: `
工学部棟の3階にある実験室Cです。

![工学部棟 実験室C](https://placehold.jp/1080x720.png)

最新の設備が整った実験室です。
`.trim(),
		createdAt: new Date(),
	},
	{
		id: crypto.randomUUID().toString(),
		name: "音楽棟 レッスン室1",
		description: `
音楽棟の1階にあるレッスン室1です。

![音楽棟 レッスン室1](https://placehold.jp/1080x720.png)

ピアノや楽器の練習に利用できます。
`.trim(),
		createdAt: new Date(),
	},
];

export const registerLocationSeed = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	for (const location of DUMMY_LOCATIONS) {
		await client.insert(schema.locations).values({
			...location,
			id: crypto.randomUUID().toString(),
		});
	}
};
