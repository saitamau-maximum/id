import { removeExpiredAccessTokenTask } from "../cron-tasks/remove-expired-access-token";
import { removeMemberRoleTask } from "../cron-tasks/remove-member-role";
import { factory } from "../factory";

const app = factory.createApp();

const route = app.get("/", async (c) => {
	const CRON_TRIGGER_TOKEN = c.env.CRON_TRIGGER_TOKEN;
	// dev なら設定なくても許容
	if (c.env.ENV !== "development" && !CRON_TRIGGER_TOKEN) {
		console.error("CRON_TRIGGER_TOKEN is not set");
		return c.text("Server configuration error", 500);
	}

	// token の検査
	const token = c.req.header("X-Cron-Trigger-Token");
	if (c.env.ENV !== "development" && token !== CRON_TRIGGER_TOKEN)
		return c.text("Invalid token", 401);

	const url = new URL(c.req.url);
	const cron = url.searchParams.get("cron");
	if (!cron) return c.text("Missing cron parameter", 400);
	// TODO: cron param の書式が合ってるかチェック
	//       valibot でそのうち実装されそう？
	// ref: https://github.com/open-circle/valibot/pull/1411

	// cron 処理
	// GitHub Actions では Asia/Tokyo の時刻で cron が動くようになっているので、 UTC での時刻を考慮する必要はない
	// ex: "0 3 * * *" は 03:00 UTC (= 12:00 JST) ではなく 03:00 JST に動く
	switch (cron) {
		case "0 3 * * *":
			console.log("Cron job executed at 03:00 JST");
			c.executionCtx.waitUntil(removeExpiredAccessTokenTask(c));
			break;

		case "0 0 1 5 *":
			console.log("Cron job executed at 00:00 JST on May 1");
			c.executionCtx.waitUntil(removeMemberRoleTask(c));
			break;

		default:
			console.warn(`Unknown cron event: ${cron}`);
			return c.text("Unknown cron event", 400);
	}

	return c.text("OK", 200);
});

export { route as cronRoute };
