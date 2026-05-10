import { Webhooks } from "@octokit/webhooks";
import { factory } from "../factory";
import { notifyDiscordOnComment } from "../webhooks-handler/github/notify-discord-on-comment";

const app = factory.createApp();

const route = app.post("/github", async (c) => {
	const secret = c.env.GITHUB_WEBHOOK_SECRET;
	if (!secret) return c.text("GITHUB_WEBHOOK_SECRET is not set", 500);

	// ここでしか使わないので、特に抽象化せず @octokit/webhooks を使う
	const webhooks = new Webhooks({ secret });

	webhooks.on("ping", () => {
		console.log("GitHub Webhook Received: ping -> pong");
	});

	// --- handler 登録 --- //
	notifyDiscordOnComment(c, webhooks);

	const id = c.req.header("x-github-delivery");
	const name = c.req.header("x-github-event");
	const signature = c.req.header("x-hub-signature-256");
	const payload = await c.req.text();

	if (!id || !name || !signature) {
		return c.body("Missing required GitHub webhook headers", 400);
	}

	if (!(await webhooks.verify(payload, signature))) {
		return c.body("Invalid GitHub webhook signature", 401);
	}

	// receive だけだと型が合わずめんどくさいので、二重 verify してしまうが verifyAndReceive を呼ぶ
	await webhooks.verifyAndReceive({ id, name, signature, payload });
	return c.body(null, 204);
});

export { route as webhookRoute };
