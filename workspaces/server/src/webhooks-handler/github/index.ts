import type { Webhooks } from "@octokit/webhooks";
import type { Context } from "hono";
import type { HonoEnv } from "../../factory";
import { notifyDiscordOnComment } from "./notify-discord-on-comment";

export const registerGithubWebhookHandlers = (
	c: Context<HonoEnv>,
	webhooks: Webhooks,
) => {
	notifyDiscordOnComment(c, webhooks);
};
