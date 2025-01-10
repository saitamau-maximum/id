import { jwt } from "hono/jwt";
import { factory } from "../factory";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
	return jwt({
		secret: c.env.SECRET,
	})(c, next);
});
