import { factory } from "../factory";
import { memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

const memberOnlyRoute = app
	.use(memberOnlyMiddleware)
	.get("/discord/invitation", async (c) => {
		if (!c.env.DISCORD_INVITATION_URL) {
			return c.text("Discord invitation URL is not set", 500);
		}
		return c.json({
			url: c.env.DISCORD_INVITATION_URL,
		});
	});

const route = app.route("/", memberOnlyRoute);

export { route as miscRoute };
