import { getSignedCookie } from "hono/cookie";
import { jwt, verify } from "hono/jwt";
import { COOKIE_NAME } from "../constants/cookie";
import { factory } from "../factory";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
	return jwt({
		secret: c.env.SECRET,
	})(c, next);
});

export const cookieAuthMiddleware = factory.createMiddleware(
	async (c, next) => {
		const jwt = await getSignedCookie(c, c.env.SECRET, COOKIE_NAME.LOGIN_STATE);
		if (jwt) {
			const payload = await verify(jwt, c.env.SECRET);
			if (payload) {
				c.set("jwtPayload", payload);
				return next();
			}
		}

		const requestUrl = new URL(c.req.url);
		const continueTo = requestUrl.pathname + requestUrl.search;
		return c.redirect(
			`/auth/login?continue_to=${encodeURIComponent(continueTo)}`,
		);
	},
);
