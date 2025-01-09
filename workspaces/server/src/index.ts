import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { factory } from "./factory";
import { CloudflareSessionRepository } from "./infrastructure/repository/cloudflare/session";
import { CloudflareUserRepository } from "./infrastructure/repository/cloudflare/user";
import { authRoute } from "./routes/auth";
import { userRoute } from "./routes/user";

const app = factory.createApp();

const route = app
	.use(logger())
	.use(async (c, next) => {
		c.set(
			"SessionRepository",
			new CloudflareSessionRepository(c.env.IDP_SESSION),
		);
		c.set("UserRepository", new CloudflareUserRepository(c.env.DB));
		await next();
	})
	.use((c, next) => {
		return cors({
			origin: c.env.CLIENT_ORIGIN,
		})(c, next);
	})
	.route("/auth", authRoute)
	.route("/user", userRoute)
	.onError((e, c) => {
		console.error(e);
		return c.text("Internal Server Error", 500);
	});

export default app;

export type AppType = typeof route;
