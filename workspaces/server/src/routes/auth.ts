import { vValidator } from "@hono/valibot-validator";
import { deleteCookie } from "hono/cookie";
import * as v from "valibot";
import { COOKIE_NAME } from "../constants/cookie";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";
import { noCacheMiddleware } from "../middleware/cache";
import { authLoginRoute } from "./auth-login";

const app = factory.createApp();

const verifyRequestQuerySchema = v.object({
	ott: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.route("/login", authLoginRoute)
	.get("/logout", noCacheMiddleware, async (c) => {
		deleteCookie(c, COOKIE_NAME.LOGIN_STATE);
		return c.redirect(`${c.env.CLIENT_ORIGIN}/login`, 302);
	})
	.get(
		"/verify",
		noCacheMiddleware,
		vValidator("query", verifyRequestQuerySchema),
		async (c) => {
			const { SessionRepository } = c.var;
			const { ott } = c.req.valid("query");

			const jwt = await SessionRepository.verifyOneTimeToken(ott);

			if (!jwt) {
				return c.body(null, 400);
			}

			return c.json({ jwt });
		},
	)
	.get("/me", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;

		const res = await UserRepository.fetchUserProfileById(payload.userId).catch(
			() => null,
		);
		if (!res) {
			return c.body(null, 404);
		}
		return c.json(res);
	})
	.get("/ping", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;
		await UserRepository.updateLastLoginAt(payload.userId);
		return c.body(null, 204);
	});

export { route as authRoute };
