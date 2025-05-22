import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";
import { authLoginRoute } from "./auth-login";

const app = factory.createApp();

const verifyRequestQuerySchema = v.object({
	ott: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.route("/login", authLoginRoute)
	.get("/verify", vValidator("query", verifyRequestQuerySchema), async (c) => {
		const { SessionRepository } = c.var;
		const { ott } = c.req.valid("query");

		const jwt = await SessionRepository.verifyOneTimeToken(ott);

		if (!jwt) {
			return c.json({ error: "invalid ott" }, 400);
		}

		return c.json({ jwt });
	})
	.get("/me", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;
		try {
			const res = await UserRepository.fetchUserProfileById(payload.userId);
			return c.json(res);
		} catch (e) {
			return c.json({ error: "user not found" }, 404);
		}
	})
	.get("/ping", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;
		try {
			await UserRepository.updateLastLoginAt(payload.userId);
			return c.json({ ok: true });
		} catch (e) {
			return c.json({ ok: false }, 500);
		}
	});

export { route as authRoute };
