import { cors } from "hono/cors";
import { factory } from "./factory";
import { CloudflareSessionRepository } from "./infrastructure/repository/cloudflare/session";
import { CloudflareUserRepository } from "./infrastructure/repository/cloudflare/user";
import { authRoute } from "./routes/auth";

const app = factory.createApp();

const route = app
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
	.route("/auth", authRoute);

export default app;

export type AppType = typeof route;
