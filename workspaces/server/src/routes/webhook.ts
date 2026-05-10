import { Webhooks } from "@octokit/webhooks";
import { factory } from "../factory";

const app = factory.createApp();

const route = app.post("/github", async (c) => {
	// ここでしか使わないので、特に抽象化せず @octokit/webhooks を使う
	const webhooks = new Webhooks({
		secret: c.env.GITHUB_WEBHOOK_SECRET,
	});

	webhooks.on("ping", () => {
		console.log("GitHub Webhook Received: ping -> pong");
	});

	await webhooks.verifyAndReceive({
		id: c.req.header("x-github-delivery") ?? "",
		name: c.req.header("x-github-event") ?? "",
		signature: c.req.header("x-hub-signature-256") ?? "",
		payload: await c.req.text(),
	});

	return c.body(null, 204);
});

export { route as webhookRoute };
