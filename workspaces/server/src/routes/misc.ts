import { ROLE_IDS } from "../constants/role";
import { factory } from "../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../middleware/auth";

const app = factory.createApp();

const memberOnlyRoute = app
	.use(authMiddleware)
	.use(
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.MEMBER],
		}),
	)
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
