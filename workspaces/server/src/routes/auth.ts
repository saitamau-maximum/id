import { vValidator } from "@hono/valibot-validator";
import { deleteCookie } from "hono/cookie";
import * as v from "valibot";
import { COOKIE_NAME } from "../constants/cookie";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";
import { authLoginRoute } from "./auth-login";

const app = factory.createApp();

const verifyRequestQuerySchema = v.object({
	ott: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.route("/login", authLoginRoute)
	.get("/logout", async (c) => {
		c.header("Cache-Control", "no-store, no-cache");
		c.header("Expires", "0");

		deleteCookie(c, COOKIE_NAME.LOGIN_STATE);
		return c.redirect(`${c.env.CLIENT_ORIGIN}/login`, 302);
	})
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
