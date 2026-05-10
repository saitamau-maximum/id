import { factory } from "../factory";

const app = factory.createApp();

const route = app.post("/github", (c) => {
	// TODO
	return c.text("OK", 200);
});

export { route as webhookRoute };
