import { removeDiscordMemberRoleTask } from "../cron-tasks/remove-discord-member-role";
import { removeExpiredAccessTokenTask } from "../cron-tasks/remove-expired-access-token";
import { removeMemberRoleTask } from "../cron-tasks/remove-member-role";
import { factory } from "../factory";

const app = factory.createApp();

// ここでしか使わないので middleware には置かずここに書く
// テストで使うので export
export const CronTriggerAuthMiddleware = factory.createMiddleware(
	async (c, next) => {
		// CRON_TRIGGER_TOKEN の存在チェック
		// dev なら設定なくても許容
		if (c.env.ENV !== "development" && !c.env.CRON_TRIGGER_TOKEN) {
			console.error("CRON_TRIGGER_TOKEN is not set");
			return c.text("Server configuration error", 500);
		}

		// token の検査
		const token = c.req.header("X-Cron-Trigger-Token");
		if (c.env.ENV !== "development" && token !== c.env.CRON_TRIGGER_TOKEN)
			return c.text("Invalid token", 401);

		return next();
	},
);

const route = app
	.use(CronTriggerAuthMiddleware)
	.post("/remove-expired-access-token", async (c) => {
		c.executionCtx.waitUntil(removeExpiredAccessTokenTask(c));
		return c.text("OK", 200);
	})
	.post("/remove-member-role", async (c) => {
		c.executionCtx.waitUntil(removeMemberRoleTask(c));
		return c.text("OK", 200);
	})
	.post("/remove-discord-member-role", async (c) => {
		c.executionCtx.waitUntil(removeDiscordMemberRoleTask(c));
		return c.text("OK", 200);
	});

export { route as cronRoute };
